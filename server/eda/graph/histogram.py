# server/eda/graph/histogram.py

import base64
import io
import matplotlib.pyplot as plt
import seaborn as sns
from django.http import JsonResponse
import plotly.express as px
import plotly.graph_objects as go
import json
import pandas as pd
import logging

# Set up logging
logger = logging.getLogger(__name__)

def histogram(df, data):
    try:
        # Extract parameters
        vars = data.get('var')  # List or single variable
        title = data.get('title')
        hue = data.get('hue')
        orient = data.get('orient')
        stat = data.get('agg')  # Aggregation function
        auto_bin = data.get('autoBin')
        kde = data.get('kde')
        legend = data.get('legend')
        color_palette = data.get('color_palette', 'husl')  # Default palette

        logger.info(f"Parameters received: vars={vars}, hue={hue}, orient={orient}, stat={stat}, auto_bin={auto_bin}, kde={kde}, legend={legend}, color_palette={color_palette}")

        if not isinstance(vars, list):
            vars = [vars]

        bins = auto_bin if isinstance(auto_bin, int) and auto_bin > 0 else "auto"

        hue_param = None if hue == "-" else hue

        png_list = []
        svg_list = []
        plotly_figs = []

        # Map 'stat' to 'histfunc' and 'histnorm'
        histfunc_mapping = {
            'count': ('count', None),
            'sum': ('sum', None),
            'avg': ('avg', None),
            'min': ('min', None),
            'max': ('max', None),
            'density': ('count', 'density'),
            'probability': ('count', 'probability'),
            'percent': ('count', 'percent')     # Assuming similar to 'probability'
        }

        histfunc, histnorm = histfunc_mapping.get(stat, ('count', None))
        logger.info(f"Mapped stat '{stat}' to histfunc='{histfunc}', histnorm='{histnorm}'")

        # Determine unique hue categories if hue is used
        if hue_param and hue_param in df.columns:
            hue_categories = df[hue_param].dropna().unique().tolist()
            num_categories = len(hue_categories)
            logger.info(f"Found hue categories: {hue_categories}")

            # Generate color palette
            if color_palette in ["husl", "tab10", "tab20", "Set2", "viridis", "plasma", "inferno", "magma"]:
                palette = sns.color_palette(color_palette, n_colors=num_categories)
            else:
                # Fallback to 'husl'
                palette = sns.color_palette("husl", n_colors=num_categories)
                logger.warning(f"Unknown color_palette '{color_palette}'. Falling back to 'husl'.")

            palette_hex = palette.as_hex()
            hue_color_mapping = dict(zip(hue_categories, palette_hex))
            logger.info(f"Generated hue_color_mapping: {hue_color_mapping}")
        else:
            hue_color_mapping = {}
            if hue_param:
                logger.warning(f"Hue parameter '{hue_param}' not found in DataFrame columns.")
            else:
                logger.info("No hue parameter provided.")

        # Iterate over variables to create Plotly figures
        for var in vars:
            logger.info(f"Creating Plotly histogram for variable: {var}")
            try:
                # Validate variable exists and is numeric
                if var not in df.columns:
                    logger.error(f"Variable '{var}' not found in DataFrame columns.")
                    continue

                if not pd.api.types.is_numeric_dtype(df[var]):
                    logger.error(f"Variable '{var}' is not numeric. KDE requires numeric data.")
                    continue

                # Create the histogram
                if orient == "Vertical":
                    fig_plotly = px.histogram(
                        df,
                        x=var,
                        color=hue_param,
                        title=title if title else f"Histogram of {var}",
                        nbins=bins if isinstance(bins, int) else None,
                        histfunc=histfunc,
                        histnorm=histnorm,
                        color_discrete_map=hue_color_mapping if hue_param else None,
                        color_discrete_sequence=None if hue_param else sns.color_palette(color_palette, n_colors=df[var].nunique()).as_hex(),
                        opacity=0.75
                    )
                else:
                    fig_plotly = px.histogram(
                        df,
                        y=var,
                        color=hue_param,
                        title=title if title else f"Histogram of {var}",
                        nbins=bins if isinstance(bins, int) else None,
                        histfunc=histfunc,
                        histnorm=histnorm,
                        orientation='h',
                        color_discrete_map=hue_color_mapping if hue_param else None,
                        color_discrete_sequence=None if hue_param else sns.color_palette(color_palette, n_colors=df[var].nunique()).as_hex(),
                        opacity=0.75
                    )

                # Manage legend
                if not legend:
                    fig_plotly.update_layout(showlegend=False)
                else:
                    fig_plotly.update_layout(showlegend=True)

                # Update layout properties
                fig_plotly.update_layout(
                    height=600,
                    width=600,
                    margin=dict(t=20) if kde else dict(t=50)
                )

                # Add KDE as a separate trace if enabled
                if kde:
                    # Calculate KDE using Seaborn
                    kde_data = sns.kdeplot(df[var].dropna(), bw_adjust=1.0)
                    kde_x = kde_data.lines[0].get_xdata()
                    kde_y = kde_data.lines[0].get_ydata()
                    plt.close()  # Close the Seaborn plot

                    # Scale KDE to match histogram
                    # Plotly doesn't support direct KDE overlay on histograms, so scaling is required
                    hist_values = fig_plotly.data[0].y if orient == "Vertical" else fig_plotly.data[0].x
                    max_hist = max(hist_values) if hist_values else 1
                    kde_y_scaled = kde_y * max_hist / max(kde_y) if max(kde_y) > 0 else kde_y

                    # Add KDE trace
                    if orient == "Vertical":
                        fig_plotly.add_trace(go.Scatter(x=kde_x, y=kde_y_scaled, mode='lines', name='KDE', line=dict(color='black')))
                    else:
                        fig_plotly.add_trace(go.Scatter(y=kde_x, x=kde_y_scaled, mode='lines', name='KDE', line=dict(color='black')))

                # Serialize Plotly figure
                plotly_fig_serialized = json.loads(fig_plotly.to_json())
                plotly_figs.append(plotly_fig_serialized)
                logger.info(f"Successfully created Plotly figure for {var}")
            except Exception as e:
                logger.error(f"Error creating Plotly histogram for variable '{var}': {e}")
                raise e  # Re-raise to be caught by outer try-except

        # Proceed with matplotlib/seaborn plots
        fig, axs = plt.subplots(nrows=1, ncols=len(vars), figsize=(6 * len(vars), 6), dpi=720)
        if len(vars) == 1:
            axs = [axs]

        for i, var in enumerate(vars):
            ax = axs[i]
            if orient == "Vertical":
                sns.histplot(
                    data=df,
                    x=var,
                    bins=bins,
                    hue=hue_param,
                    kde=kde,
                    stat=stat,
                    palette=hue_color_mapping if hue_param else 'Blues',
                    ax=ax,
                    legend=legend
                )
            else:
                sns.histplot(
                    data=df,
                    y=var,
                    bins=bins,
                    hue=hue_param,
                    kde=kde,
                    stat=stat,
                    palette=hue_color_mapping if hue_param else 'Blues',
                    ax=ax,
                    legend=legend
                )

            if title:
                ax.set_title(title)

        plt.tight_layout()

        # Save the figure in both PNG and SVG formats
        image_stream_png = io.BytesIO()
        plt.savefig(image_stream_png, format='png', bbox_inches='tight')
        image_stream_png.seek(0)
        image_base64_png = base64.b64encode(image_stream_png.getvalue()).decode('utf-8')
        png_list.append(image_base64_png)

        image_stream_svg = io.BytesIO()
        plt.savefig(image_stream_svg, format='svg', bbox_inches='tight')
        image_stream_svg.seek(0)
        image_svg = image_stream_svg.getvalue().decode('utf-8')
        svg_list.append(image_svg)

        plt.close(fig)

        # Return images and Plotly figures in the response
        response_data = {
            'png': png_list,       # List of base64-encoded PNG images
            'svg': svg_list,       # List of SVG image strings
            'plotly': plotly_figs  # List of serialized Plotly figures
        }
        return JsonResponse(response_data)

    except Exception as e:
        logger.error(f"Error in histogram: {e}")
        return JsonResponse({'error': str(e)}, status=500)
