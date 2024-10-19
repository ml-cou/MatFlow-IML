import base64
import io
import matplotlib.pyplot as plt
import seaborn as sns
from django.http import JsonResponse
import plotly.express as px
import json
import pandas as pd
import statsmodels.api as sm

def regplot(df, data):
    # Extract parameters
    xs = data.get('x_var')  # This can be a list
    y = data.get('y_var')
    title = data.get('title')
    scatter = data.get('scatter')
    color_palette = data.get('color_palette', 'husl')  # Default palette

    if not isinstance(xs, list):
        xs = [xs]

    # For Plotly, we'll handle all x variables
    plotly_figs = []
    png_list = []
    svg_list = []

    for x in xs:
        # Determine unique hue categories if hue is used
        hue_param = None  # Assuming no hue in regplot, adjust if needed

        # Choose a palette based on the selected palette
        palette = sns.color_palette(color_palette, n_colors=1)
        palette_hex = palette.as_hex()
        line_color = palette_hex[0]

        # Create Plotly scatter with trendline
        fig_plotly = px.scatter(
            df,
            x=x,
            y=y,
            trendline="ols",
            title=title if title else f"Regression Plot of {y} vs {x}"
        )

        if not scatter:
            fig_plotly.update_traces(marker=dict(color='rgba(0,0,0,0)'))  # Hide scatter points

        fig_plotly.update_traces(marker=dict(color=line_color))
        fig_plotly.update_layout(
            height=600,
            width=600,
            showlegend=True
        )

        plotly_figs.append(json.loads(fig_plotly.to_json()))

        # Create matplotlib/seaborn regression plot
        fig, ax = plt.subplots(figsize=(6, 6), dpi=720)

        sns.regplot(data=df, x=x, y=y, scatter=scatter, ax=ax, line_kws={'color': line_color})

        if title:
            ax.set_title(title)
        else:
            ax.set_title(f"Regression Plot of {y} vs {x}")

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
        'png': png_list,        # List of base64-encoded PNG images
        'svg': svg_list,        # List of SVG image strings
        'plotly': plotly_figs,  # List of serialized Plotly figures
    }
    return JsonResponse(response_data)
