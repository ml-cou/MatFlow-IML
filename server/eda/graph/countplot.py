# server/eda/graph/countplot.py

import base64
import io
import matplotlib.pyplot as plt
import seaborn as sns
from django.http import JsonResponse
import plotly.express as px
import json
import pandas as pd
import logging

# Set up logging
logger = logging.getLogger(__name__)

def countplot(df, data):
    try:
        # Extract parameters
        vars = data.get('cat')  # This can be a list
        title = data.get('title')
        hue = data.get('hue')
        orient = data.get('orient')
        annotate = data.get('annotate', False)  # Default to False
        color_palette = data.get('color_palette', 'husl')  # Default palette

        if not isinstance(vars, list):
            vars = [vars]

        hue_param = None if hue == "-" else hue

        png_list = []
        svg_list = []

        # Function to generate a color palette based on the number of categories
        def generate_palette(n_colors, palette_type='husl'):
            if palette_type in ["husl", "tab10", "tab20", "Set2"]:
                return sns.color_palette(palette_type, n_colors=n_colors).as_hex()
            else:
                # Fallback to husl if an unknown palette is provided
                return sns.color_palette("husl", n_colors=n_colors).as_hex()

        # Determine unique hue categories if hue is used
        if hue_param and hue_param in df.columns:
            hue_categories = df[hue_param].dropna().unique().tolist()
            num_hue_categories = len(hue_categories)

            # Generate palette for hue categories
            hue_palette = generate_palette(num_hue_categories, color_palette)
            hue_color_mapping = dict(zip(hue_categories, hue_palette))
        else:
            hue_color_mapping = {}

        # Create separate matplotlib figures for each categorical variable
        for var in vars:
            fig, ax = plt.subplots(figsize=(6, 6), dpi=720)

            # Set title
            if title:
                ax.set_title(title)
            else:
                ax.set_title(f"Count Plot of {var}")

            # Determine unique categories for the main variable
            unique_categories = df[var].dropna().unique().tolist()
            num_categories = len(unique_categories)

            if orient == "Vertical":
                if hue_param:
                    # Seaborn handles hue color mapping
                    sns.countplot(data=df, x=var, hue=hue_param, palette=hue_color_mapping, dodge=True, ax=ax)
                else:
                    # Generate palette for each category
                    main_palette = generate_palette(num_categories, color_palette)
                    sns.countplot(data=df, x=var, palette=main_palette, dodge=True, ax=ax)
            else:
                if hue_param:
                    sns.countplot(data=df, y=var, hue=hue_param, palette=hue_color_mapping, dodge=True, ax=ax)
                else:
                    main_palette = generate_palette(num_categories, color_palette)
                    sns.countplot(data=df, y=var, palette=main_palette, dodge=True, ax=ax)

            # Add annotations if required
            if annotate:
                if orient == "Vertical":
                    for bar in ax.patches:
                        height = bar.get_height()
                        if height > 0:
                            ax.annotate(f'{int(height)}',
                                        (bar.get_x() + bar.get_width() / 2, height),
                                        ha='center', va='bottom',
                                        size=11, xytext=(0, 8),
                                        textcoords='offset points')
                else:
                    for rect in ax.patches:
                        width = rect.get_width()
                        if width > 0:
                            ax.annotate(f'{int(width)}',
                                        (width, rect.get_y() + rect.get_height() / 2),
                                        ha='left', va='center',
                                        size=11, xytext=(8, 0),
                                        textcoords='offset points')

            plt.tight_layout()

            # Manage legend
            if hue_param:
                ax.legend(title=hue_param)
            else:
                ax.legend().remove()

            # Save the figure to a PNG buffer
            image_stream_png = io.BytesIO()
            fig.savefig(image_stream_png, format='png', bbox_inches='tight')
            image_stream_png.seek(0)
            image_base64_png = base64.b64encode(image_stream_png.getvalue()).decode('utf-8')
            png_list.append(image_base64_png)

            # Save the figure to an SVG buffer
            image_stream_svg = io.BytesIO()
            fig.savefig(image_stream_svg, format='svg', bbox_inches='tight')
            image_stream_svg.seek(0)
            image_svg = image_stream_svg.getvalue().decode('utf-8')
            svg_list.append(image_svg)

            plt.close(fig)

        # Create separate Plotly figures
        plotly_figs = []

        for var in vars:
            # Determine unique categories for the main variable
            unique_categories = df[var].dropna().unique().tolist()
            num_categories = len(unique_categories)

            if orient == "Vertical":
                if hue_param:
                    fig_plotly = px.histogram(
                        df,
                        x=var,
                        color=hue_param,
                        title=title if title else f"Count Plot of {var}",
                        barmode='group',
                        text_auto=annotate,
                        color_discrete_map=hue_color_mapping  # Map hue categories to colors
                    )
                else:
                    # Generate color sequence for each category
                    main_palette = generate_palette(num_categories, color_palette)
                    fig_plotly = px.histogram(
                        df,
                        x=var,
                        title=title if title else f"Count Plot of {var}",
                        barmode='relative',
                        text_auto=annotate,
                        color_discrete_sequence=main_palette  # Assign different colors to each category
                    )
            else:
                if hue_param:
                    fig_plotly = px.histogram(
                        df,
                        y=var,
                        color=hue_param,
                        title=title if title else f"Count Plot of {var}",
                        barmode='group',
                        orientation='h',
                        text_auto=annotate,
                        color_discrete_map=hue_color_mapping
                    )
                else:
                    main_palette = generate_palette(num_categories, color_palette)
                    fig_plotly = px.histogram(
                        df,
                        y=var,
                        title=title if title else f"Count Plot of {var}",
                        barmode='relative',
                        orientation='h',
                        text_auto=annotate,
                        color_discrete_sequence=main_palette
                    )

            if annotate:
                fig_plotly.update_traces(textposition='outside')

            fig_plotly.update_layout(
                height=600,
                width=600,
                showlegend=True
            )

            plotly_figs.append(json.loads(fig_plotly.to_json()))

        # Prepare the JSON response with separate lists for PNGs, SVGs, and Plotly figures
        response_data = {
            'png': png_list,  # List of base64-encoded PNG images
            'svg': svg_list,  # List of SVG image strings
            'plotly': plotly_figs,  # List of serialized Plotly figures
        }
        return JsonResponse(response_data)

    except Exception as e:
        logger.error(f"Error in countplot: {e}")
        return JsonResponse({'error': str(e)}, status=500)
