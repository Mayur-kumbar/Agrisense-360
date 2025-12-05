import base64
from io import BytesIO
from PIL import Image
import numpy as np

def to_png_base64(ndvi_arr, vmin=-1.0, vmax=1.0, size=(256,256)):
    """
    Convert a floating ndvi array (range -1..1) to a small colored PNG preview (base64).
    This is a simple visualization: map NDVI to an RGB colormap (green->yellow->brown)
    """
    # normalize to 0..1
    nd = np.clip((ndvi_arr - vmin) / (vmax - vmin), 0, 1)
    # simple colormap: low=brown, mid=yellow, high=green
    # assemble RGB channels
    r = (1 - nd) * 220 + nd * 80    # transition red channel
    g = (1 - nd) * 180 + nd * 200   # transition green channel
    b = (1 - nd) * 150 + nd * 50    # transition blue channel
    rgb = np.stack([r, g, b], axis=-1).astype('uint8')
    # resize to size
    img = Image.fromarray(rgb)
    img = img.resize(size, Image.BILINEAR)
    buf = BytesIO()
    img.save(buf, format='PNG')
    encoded = base64.b64encode(buf.getvalue()).decode('ascii')
    return encoded
