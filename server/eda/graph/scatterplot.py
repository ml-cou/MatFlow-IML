import base64
import io
import matplotlib.pyplot as plt
import seaborn as sns
from django.http import JsonResponse
import plotly.express as px
import json

def scatterplot(df, data):
    """
    Generates scatter plots based on the provided data and returns
    separate PNG, SVG, and Plotly representations for each plot.
    """
    # Extract parameters
    xs = data.get('x_var')  # This can be a list
    y = data.get('y_var')
    hue = data.get('hue')
    title = data.get('title')

    # Ensure xs is a list
    if not isinstance(xs, list):
        xs = [xs]

    hue_param = None if hue == "-" else hue

    # Initialize lists to hold image data
    png_list = []
    svg_list = []

    # Determine unique hue categories if hue is used
    if hue_param:
        hue_categories = df[hue_param].unique().tolist()
        num_categories = len(hue_categories)
        # Choose a color palette
        palette = sns.color_palette("husl", n_colors=num_categories)
        # Convert palette to hex
        palette_hex = palette.as_hex()
        # Create a mapping from category to color
        hue_color_mapping = dict(zip(hue_categories, palette_hex))
    else:
        hue_color_mapping = {}

    # Create separate matplotlib figures for each x variable
    for x in xs:
        # Create a new figure and axis for each plot
        fig, ax = plt.subplots(figsize=(6, 6), dpi=720)

        # Set the title if provided
        if title:
            ax.set_title(title)
        else:
            ax.set_title(f"Scatter Plot of {y} vs {x}")

        # Generate the scatter plot using seaborn with the defined palette
        if hue_param:
            sns.scatterplot(
                data=df,
                x=x,
                y=y,
                hue=hue_param,
                palette=hue_color_mapping,
                ax=ax
            )
        else:
            sns.scatterplot(
                data=df,
                x=x,
                y=y,
                ax=ax,
                color='blue'  # Default color if no hue
            )

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

    for x in xs:
        # Create a Plotly scatter plot for each x variable
        if hue_param:
            fig_plotly = px.scatter(
                df,
                x=x,
                y=y,
                color=hue_param,
                color_discrete_map=hue_color_mapping,  # Use the same color mapping
                title=title if title else f"Scatter Plot of {y} vs {x}"
            )
        else:
            fig_plotly = px.scatter(
                df,
                x=x,
                y=y,
                color_discrete_sequence=['blue'],  # Default color
                title=title if title else f"Scatter Plot of {y} vs {x}"
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
