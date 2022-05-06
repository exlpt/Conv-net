import * as util from "../util.js";

import Convolver from "../network/Convolver.js";
import Flattener from "../network/Flattener.js";
import Activator from "../network/Activator.js";
import FullConnecter from "../network/FullConnecter.js";
import Pooler from "../network/Pooler.js";

export function grabRedChannel(canvas) {
  const ctx = canvas.getContext("2d");

  // Grab data
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const raw = imgData.data;

  // Format into arr
  let i = 0;
  let out = [];
  for (let row = 0; row < imgData.height; row++) {
    let outRow = [];
    for (let col = 0; col < imgData.width; col++) {
      outRow.push(raw[i]);
      i += 4;
    }
    out.push(outRow);
  }

  return out;
}

export function mapImage(image, newMin, newMax) {
  // Find min and max of image
  let min = image[0][0];
  let max = image[0][0];

  image.forEach((row) => {
    row.forEach((pixel) => {
      if (pixel > max) max = pixel;
      if (pixel < min) min = pixel;
    });
  });

  // Interp values
  return image.map((row) => row.map((pixel) => util.map(pixel, min, max, newMin, newMax)));
}

export function renderRedChannel(image, canvas) {
  const ctx = canvas.getContext("2d");

  canvas.width = image[0].length;
  canvas.height = image.length;

  const imageData = ctx.createImageData(image[0].length, image.length);
  let ind = 0;
  image.forEach((row) => {
    row.forEach((pixel) => {
      imageData.data[ind] = pixel;
      imageData.data[ind + 1] = pixel;
      imageData.data[ind + 2] = pixel;
      imageData.data[ind + 3] = 255;
      ind += 4;
    });
  });

  ctx.putImageData(imageData, 0, 0);
}

export function clearCanvas(canvas) {
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#FFFFFF";
  ctx.rect(0, 0, canvas.width, canvas.height);
  ctx.fill();
}

export function addNetworkToDOM(network, rootElement) {
  // Add input
  const inputContainer = document.createElement("div");
  inputContainer.classList.add(`input-container`);
  const inputCanvas = document.createElement("canvas");
  inputCanvas.classList.add(`input`);
  inputContainer.appendChild(inputCanvas);
  rootElement.appendChild(inputContainer);

  // Add layers
  let outputCount = 1;
  network.layers.forEach((layer) => {
    let layerType = "";

    if (layer instanceof Convolver) {
      layerType = "convolver";
      outputCount *= layer.filters.length;
    } else if (layer instanceof Flattener) {
      layerType = "flattener";
      outputCount = 1;
    } else if (layer instanceof Activator) layerType = "activator";
    else if (layer instanceof FullConnecter) layerType = "full-connecter";
    else if (layer instanceof Pooler) layerType = "pooler";

    const container = document.createElement("div");
    container.classList.add(`${layerType}-container`);

    for (let i = 0; i < outputCount; i++) {
      const canvas = document.createElement("canvas");
      canvas.classList.add(`${layerType}-output`);

      container.appendChild(canvas);
    }

    rootElement.appendChild(container);
  });
}

export function renderNetwork(network, rootElement) {
  renderRedChannel(mapImage(network.input, 0, 255), rootElement.children.item(0).children.item(0));

  for (let layer = 0; layer < network.layers.length; layer++) {
    if (network.layers[layer] instanceof Flattener || network.layers[layer] instanceof FullConnecter) {
      let formatted = [];
      network.layers[layer].output.forEach((value) => formatted.push([value]));

      renderRedChannel(
        mapImage(formatted, 0, 255),
        rootElement.children.item(layer + 1).children.item(0)
      );
    } else {
      for (let output = 0; output < network.layers[layer].output.length; output++) {
        renderRedChannel(
          mapImage(network.layers[layer].output[output], 0, 255),
          rootElement.children.item(layer + 1).children.item(output)
        );
      }
    }
  }
}
