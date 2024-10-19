import base64
import io
import matplotlib.pyplot as plt
import seaborn as sns
from django.http import JsonResponse
import plotly.express as px
import json
import pandas as pd


def lineplot(df, data):
    # Extract parameters
    xs = data.get('x_var')  # This can be a list
    y = data.get('y_var')
    hue = data.get('hue')
    style = data.get('style')
    legend = data.get('legend')
    title = data.get('title')
    color_palette = data.get('color_palette', 'husl')  # Default palette

    if not isinstance(xs, list):
        xs = [xs]

    # For Plotly, we'll handle all x variables
    hue_param = None if hue == "-" else hue

    png_list = []
    svg_list = []
    plotly_figs = []

    # Determine unique hue categories if hue is used
    if hue_param:
        hue_categories = df[hue_param].unique().tolist()
        num_categories = len(hue_categories)

        # Choose a palette based on the selected palette and number of categories
        if color_palette == "husl":
            palette = sns.color_palette("husl", n_colors=num_categories)
        elif color_palette == "tab10":
            palette = sns.color_palette("tab10", n_colors=num_categories)
        elif color_palette == "tab20":
            palette = sns.color_palette("tab20", n_colors=num_categories)
        elif color_palette == "Set2":
            palette = sns.color_palette("Set2", n_colors=num_categories)
        else:
            # Fallback to husl if an unknown palette is provided
            palette = sns.color_palette("husl", n_colors=num_categories)

        palette_hex = palette.as_hex()
        hue_color_mapping = dict(zip(hue_categories, palette_hex))
    else:
        hue_color_mapping = {}

    # Create separate matplotlib figures for each x variable
    for x in xs:
        fig, ax = plt.subplots(figsize=(6, 6), dpi=720)

        if title:
            ax.set_title(title)
        else:
            ax.set_title(f"Line Plot of {y} vs {x}")

        if hue_param:
            sns.lineplot(data=df, x=x, y=y, hue=hue_param, style=style if style != "-" else None,
                         palette=hue_color_mapping, legend=legend, ax=ax)
        else:
            sns.lineplot(data=df, x=x, y=y, style=None if style == "-" else style,
                         color='blue', legend=legend, ax=ax)

        plt.tight_layout()

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

    # Create separate Plotly figures for each x variable
    for x in xs:
        if hue_param:
            fig_plotly = px.line(
                df,
                x=x,
                y=y,
                color=hue_param,
                line_dash=style if style != "-" else None,
                color_discrete_map=hue_color_mapping,
                title=title if title else f"Line Plot of {y} vs {x}"
            )
        else:
            fig_plotly = px.line(
                df,
                x=x,
                y=y,
                line_dash=style if style != "-" else None,
                color_discrete_sequence=['blue'],
                title=title if title else f"Line Plot of {y} vs {x}"
            )

        if not legend:
            fig_plotly.update_layout(showlegend=False)

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
