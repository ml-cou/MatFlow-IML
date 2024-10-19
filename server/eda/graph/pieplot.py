import base64
import io
import matplotlib.pyplot as plt
import seaborn as sns
from django.http import JsonResponse
import plotly.express as px
import json
import pandas as pd


def pieplot(df, data):
    # Extract parameters
    vars = data.get('cat')  # This can be a list
    explode = float(data.get('gap', 0))  # Default to 0 if not provided
    title = data.get('title')
    label = data.get('label')
    percentage = data.get('percentage')
    color_palette = data.get('color_palette', 'husl')  # Default palette

    if not isinstance(vars, list):
        vars = [vars]

    # For Plotly, we'll handle all variables
    png_list = []
    svg_list = []
    plotly_figs = []

    # Determine unique categories for each variable and assign colors
    for var in vars:
        unique_categories = df[var].dropna().unique().tolist()
        num_categories = len(unique_categories)

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
        category_color_mapping = dict(zip(unique_categories, palette_hex))

        # Create Plotly pie chart
        fig_plotly = px.pie(
            df,
            names=var,
            title=title if title else f"Pie Chart of {var}",
            hole=explode if explode > 0 else 0
        )

        if not label:
            fig_plotly.update_traces(textinfo='none')
        elif percentage:
            fig_plotly.update_traces(textinfo='percent+label')
        else:
            fig_plotly.update_traces(textinfo='label')

        fig_plotly.update_traces(marker=dict(colors=palette_hex))

        fig_plotly.update_layout(
            height=600,
            width=600,
            showlegend=True
        )

        plotly_figs.append(json.loads(fig_plotly.to_json()))

        # Create matplotlib/seaborn pie chart
        fig, ax = plt.subplots(figsize=(6, 6), dpi=720)
        sizes = df[var].value_counts().values
        labels_unique = df[var].value_counts().index.tolist()
        colors_list = [category_color_mapping[label] for label in labels_unique]

        if percentage:
            autopct = '%1.2f%%'
        elif label:
            autopct = None
        else:
            autopct = None

        wedges, texts, autotexts = ax.pie(
            sizes,
            labels=labels_unique if label else None,
            autopct=autopct,
            explode=[explode for _ in labels_unique],
            colors=colors_list,
            startangle=140
        )

        if not label:
            ax.set_ylabel('')

        ax.axis('equal')  # Equal aspect ratio ensures that pie is drawn as a circle.

        if title:
            ax.set_title(title)

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

    # Prepare the JSON response with separate lists for PNGs, SVGs, and Plotly figures
    response_data = {
        'png': png_list,  # List of base64-encoded PNG images
        'svg': svg_list,  # List of SVG image strings
        'plotly': plotly_figs,  # List of serialized Plotly figures
    }
    return JsonResponse(response_data)
