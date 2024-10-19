import base64
import io
import matplotlib.pyplot as plt
import seaborn as sns
from django.http import JsonResponse
import plotly.express as px
import json
import pandas as pd


def violinplot(df, data):
    # Extract parameters
    cats = data.get('cat')  # This can be a list
    num = data.get('num')
    hue = data.get('hue')
    orient = data.get('orient')
    dodge = data.get('dodge', True)
    split = data.get('split', False)
    title = data.get('title')
    color_palette = data.get('color_palette', 'husl')  # Default palette

    if not isinstance(cats, list):
        cats = [cats]

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

    # Create separate matplotlib figures for each categorical variable
    for cat in cats:
        fig, ax = plt.subplots(figsize=(6, 6), dpi=720)

        if title:
            ax.set_title(title)
        else:
            if orient == "Vertical":
                ax.set_title(f"Violin Plot of {num} by {cat}")
            else:
                ax.set_title(f"Violin Plot of {num} by {cat}")

        if orient == "Vertical":
            if hue_param:
                sns.violinplot(
                    data=df,
                    x=cat,
                    y=num,
                    hue=hue_param,
                    dodge=dodge,
                    split=split,
                    palette=hue_color_mapping,
                    ax=ax
                )
            else:
                sns.violinplot(
                    data=df,
                    x=cat,
                    y=num,
                    dodge=dodge,
                    split=split,
                    palette='Blues',
                    ax=ax
                )
        else:
            if hue_param:
                sns.violinplot(
                    data=df,
                    x=num,
                    y=cat,
                    hue=hue_param,
                    dodge=dodge,
                    split=split,
                    palette=hue_color_mapping,
                    ax=ax,
                    orient='h'
                )
            else:
                sns.violinplot(
                    data=df,
                    x=num,
                    y=cat,
                    dodge=dodge,
                    split=split,
                    palette='Blues',
                    ax=ax,
                    orient='h'
                )

        # Adjust legend
        if hue_param:
            if split:
                ax.legend(title=hue_param, bbox_to_anchor=(1.05, 1), loc='upper left')
            else:
                ax.legend(title=hue_param, bbox_to_anchor=(1.05, 1), loc='upper left')
        else:
            ax.legend_.remove() if ax.get_legend() else None

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

    # Create separate Plotly figures for each categorical variable
    for cat in cats:
        if orient == "Vertical":
            if hue_param:
                fig_plotly = px.violin(
                    df,
                    x=cat,
                    y=num,
                    color=hue_param,
                    orientation='v',
                    title=title if title else f"Violin Plot of {num} by {cat}",
                    box=dodge,
                    points='all' if split else 'outliers',
                    color_discrete_map=hue_color_mapping
                )
            else:
                fig_plotly = px.violin(
                    df,
                    x=cat,
                    y=num,
                    orientation='v',
                    title=title if title else f"Violin Plot of {num} by {cat}",
                    box=dodge,
                    points='all' if split else 'outliers',
                    color_discrete_sequence=['#1f77b4']  # Default blue
                )
        else:
            if hue_param:
                fig_plotly = px.violin(
                    df,
                    y=cat,
                    x=num,
                    color=hue_param,
                    orientation='h',
                    title=title if title else f"Violin Plot of {num} by {cat}",
                    box=dodge,
                    points='all' if split else 'outliers',
                    color_discrete_map=hue_color_mapping
                )
            else:
                fig_plotly = px.violin(
                    df,
                    y=cat,
                    x=num,
                    orientation='h',
                    title=title if title else f"Violin Plot of {num} by {cat}",
                    box=dodge,
                    points='all' if split else 'outliers',
                    color_discrete_sequence=['#1f77b4']  # Default blue
                )

        # Update layout for consistency
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

