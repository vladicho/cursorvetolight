const PYODIDE_VERSION = "v314.0.5";
const PYODIDE_BASE_URL = `https://cdn.jsdelivr.net/pyodide/${PYODIDE_VERSION}/full/`;

let runtimePromise;

function notifyStatus(message) {
  self.postMessage({ type: "status", message });
}

async function initializeRuntime() {
  if (!runtimePromise) {
    runtimePromise = (async () => {
      notifyStatus("Carregando o motor Python no navegador...");
      importScripts(`${PYODIDE_BASE_URL}pyodide.js`);
      const runtime = await loadPyodide({ indexURL: PYODIDE_BASE_URL });
      notifyStatus("Carregando NumPy, Pillow e scikit-image...");
      await runtime.loadPackage(["numpy", "Pillow", "scikit-image"]);
      await runtime.runPythonAsync(`
import base64
import io
import json

import numpy as np
from PIL import Image
from skimage import color, filters, measure, morphology, transform


def decode_data_url(data_url):
    if not data_url or "," not in data_url:
        raise ValueError("Imagem ausente.")
    _, encoded = data_url.split(",", 1)
    raw = base64.b64decode(encoded)
    return np.asarray(Image.open(io.BytesIO(raw)).convert("RGB"))


def resize_image(image, max_side=900):
    height, width = image.shape[:2]
    scale = min(1.0, max_side / max(width, height))
    if scale >= 1:
        return image
    new_size = (max(1, round(height * scale)), max(1, round(width * scale)))
    resized = transform.resize(image, new_size, preserve_range=True, anti_aliasing=True)
    return resized.astype(np.uint8)


def largest_component(mask):
    labels = measure.label(mask)
    regions = measure.regionprops(labels)
    if not regions:
        return None
    region = max(regions, key=lambda item: item.area)
    return labels == region.label


def contour_points(mask, max_points):
    contours = measure.find_contours(mask.astype(float), 0.5)
    if not contours:
        return []
    contour = max(contours, key=len)
    tolerance = max(2.0, min(mask.shape) * 0.006)
    simplified = measure.approximate_polygon(contour, tolerance=tolerance)
    if len(simplified) > max_points:
        step = max(1, int(np.ceil(len(simplified) / max_points)))
        simplified = simplified[::step]
    return [{"x": float(col), "y": float(row)} for row, col in simplified]


def digitize_scikit(data_url, max_points=220):
    image = resize_image(decode_data_url(data_url))
    gray = color.rgb2gray(image)
    threshold = filters.threshold_otsu(gray)
    border = np.concatenate([gray[0, :], gray[-1, :], gray[:, 0], gray[:, -1]])
    foreground = gray < threshold if float(border.mean()) > threshold else gray > threshold
    foreground = morphology.remove_small_objects(foreground, min_size=96)
    foreground = morphology.binary_closing(foreground, morphology.disk(3))
    foreground = morphology.binary_opening(foreground, morphology.disk(1))
    component = largest_component(foreground)
    if component is None or int(component.sum()) < 80:
        raise ValueError("Nenhum contorno forte encontrado.")
    points = contour_points(component, max_points)
    if len(points) < 8:
        raise ValueError("Contorno insuficiente.")
    height, width = component.shape
    return json.dumps({"ok": True, "width": width, "height": height, "points": points})
`);
      notifyStatus("Motor scikit-image pronto.");
      return runtime;
    })().catch((error) => {
      runtimePromise = undefined;
      throw error;
    });
  }
  return runtimePromise;
}

self.addEventListener("message", async (event) => {
  const { type, requestId, dataUrl, maxPoints = 220 } = event.data || {};
  if (type !== "digitize" || !requestId) return;

  try {
    const runtime = await initializeRuntime();
    notifyStatus("Analisando a imagem com scikit-image...");
    runtime.globals.set("moldelab_data_url", dataUrl);
    runtime.globals.set("moldelab_max_points", maxPoints);
    const serialized = await runtime.runPythonAsync(
      "digitize_scikit(moldelab_data_url, moldelab_max_points)",
    );
    runtime.globals.delete("moldelab_data_url");
    runtime.globals.delete("moldelab_max_points");
    self.postMessage({ type: "result", requestId, payload: JSON.parse(serialized) });
  } catch (error) {
    self.postMessage({
      type: "error",
      requestId,
      error: error?.message || String(error) || "Falha ao executar scikit-image.",
    });
  }
});

