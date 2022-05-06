import * as util from "../util.js";
import * as trainerUtil from "./trainerUtil.js";

import Convolver from "../network/Convolver.js";
import FullConnecter from "../network/FullConnecter.js";

export function cost(networkOutput, label) {
  return networkOutput.reduce((total, output, index) => total + trainerUtil.cost(output, label[index]), 0);
}

export function crossEntropy(networkOutput, label) {
	return -networkOutput.reduce((total, output, index) => total + trainerUtil.crossEntropy(output, label[index]), 0);
}

export function computeBatchGradient(network, batch, learningRate) {
  // TODO: calculate stuff like derivatives, etc otf...
  // TODO: account for multiple FullConnecters
  // ==============================================================
  let paramCount = 0;
  network.layers.forEach((layer) => {
    if (layer instanceof Convolver)
      layer.filters.forEach((filter) => filter.forEach((row) => row.forEach((param) => paramCount++)));
    else if (layer instanceof FullConnecter)
      layer.weightMatrix.forEach((row) => row.forEach((param) => paramCount++));
  });

  let out = [];
  for (let i = 0; i < paramCount; i++) out.push(0);

  batch.forEach((example) => {
    // Calculate example gradient
    let paramInd = 0;

    // Initial network calculation
    const baseCost = crossEntropy(network.calculate(example.input), example.output);

    const a = [...network.layers[3].output];
    const z = [...network.layers[4].z];
    const z1 = [...network.layers[4].z1];
    const z1Sum = network.layers[4].z1Sum;
    const a1 = [...network.layers[4].a1];

    // Filters
    network.layers[0].filters.forEach((filter) =>
      filter.forEach((row) =>
        row.forEach((value, valueInd) => {
          row[valueInd] += 1;
          const newCost = crossEntropy(network.calculate(example.input), example.output);
          row[valueInd] -= 1;

          out[paramInd] += (newCost - baseCost) * -learningRate;
          paramInd++;
        })
      )
    );

    // Weight matricies
    network.layers[4].weightMatrix.forEach((output, outInd) =>
      output.forEach((weight, weightInd) => {
        const nudge =
          a[weightInd] *
          trainerUtil.dSigmoid(z[outInd]) *
          (1 / z1Sum) *
          //trainerUtil.dCost(a1[outInd], example.output[outInd]) *
					trainerUtil.dCrossEntropy(a1, example.output) *
          -learningRate;
        //out[paramInd] += nudge;
        paramInd++;
      })
    );
  });

  // Scale gradient
  return out.map((value) => value / batch.length);
}

export function applyGradient(network, gradient) {
  let gradientInd = 0;

  network.layers.forEach((layer) => {
    if (layer instanceof Convolver) {
      layer.filters.forEach((filter) =>
        filter.forEach((row) =>
          row.forEach((param, colInd) => {
            row[colInd] += gradient[gradientInd];
            gradientInd++;
          })
        )
      );
    } else if (layer instanceof FullConnecter) {
      layer.weightMatrix.forEach((output) =>
        output.forEach((param, inpInd) => {
          output[inpInd] += gradient[gradientInd];
          gradientInd++;
        })
      );
    }
  });
}
