import base64
import io
import matplotlib.pyplot as plt
import seaborn as sns
from django.http import JsonResponse
import plotly.express as px
import json
import pandas as pd

def boxplot(df, data):
    """
    Generates box plots based on the provided data and returns
    separate PNG, SVG, and Plotly representations for each plot.

    Args:
        df (pd.DataFrame): The DataFrame containing the data.
        data (dict): A dictionary containing plot parameters.

    Returns:
        JsonResponse: A JSON response containing lists of PNGs, SVGs, and Plotly figures.
    """
    # Extract parameters
    cats = data.get('cat')  # This can be a list
    num = data.get('num')
    hue = data.get('hue')
    orient = data.get('orient', 'Vertical')  # Default orientation
    dodge = data.get('dodge', True)         # Default dodge
    title = data.get('title', '')
    color_palette = data.get('color_palette', 'husl')  # Default palette

    # Ensure cats is a list
    if not isinstance(cats, list):
        cats = [cats]

    hue_param = None if hue == "-" else hue

    # Initialize lists to hold image data
    png_list = []
    svg_list = []

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
        # Create a new figure and axis for each plot
        fig, ax = plt.subplots(figsize=(6, 6), dpi=720)

        # Set the title if provided
        if title:
            ax.set_title(title)
        else:
            ax.set_title(f"Box Plot of {num} by {cat}")

        # Generate the box plot using seaborn with the defined palette
        if hue_param:
            sns.boxplot(
                data=df,
                x=cat if orient == "Vertical" else num,
                y=num if orient == "Vertical" else cat,
                hue=hue_param,
                palette=hue_color_mapping,
                dodge=dodge if orient == "Vertical" else False,  # Dodge only applies vertically
                orient='v' if orient == "Vertical" else 'h',
                ax=ax
            )
        else:
            sns.boxplot(
                data=df,
                x=cat if orient == "Vertical" else num,
                y=num if orient == "Vertical" else cat,
                color='blue',  # Default color if no hue
                orient='v' if orient == "Vertical" else 'h',
                ax=ax
            )

        # Adjust legend placement if multiple plots are being created
        if hue_param:
            ax.legend_.remove()  # Remove individual legends to avoid repetition

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

        # Close the figure to free up memory
        plt.close(fig)

    # Create separate Plotly figures
    plotly_figs = []

    for cat in cats:
        # Determine Plotly orientation
        plot_orient = 'v' if orient == "Vertical" else 'h'

        # Create a Plotly box plot for each categorical variable
        if hue_param:
            fig_plotly = px.box(
                df,
                x=cat if orient == "Vertical" else num,
                y=num if orient == "Vertical" else cat,
                color=hue_param,
                color_discrete_map=hue_color_mapping,  # Use the same color mapping
                orientation=plot_orient,
                title=title if title else f"Box Plot of {num} by {cat}"
            )
        else:
            fig_plotly = px.box(
                df,
                x=cat if orient == "Vertical" else num,
                y=num if orient == "Vertical" else cat,
                color_discrete_sequence=['blue'],  # Default color
                orientation=plot_orient,
                title=title if title else f"Box Plot of {num} by {cat}"
            )

        # Update the layout for consistency
        fig_plotly.update_layout(
            height=600,
            width=600,
            showlegend=True
        )

        # Serialize the Plotly figure to JSON and append to the list
        plotly_figs.append(json.loads(fig_plotly.to_json()))

    # Prepare the JSON response with separate lists for PNGs, SVGs, and Plotly figures
    response_data = {
        'png': png_list,        # List of base64-encoded PNG images
        'svg': svg_list,        # List of SVG image strings
        'plotly': plotly_figs,  # List of serialized Plotly figures
    }

    return JsonResponse(response_data)
