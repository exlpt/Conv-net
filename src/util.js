export function convolve(input, filter) {
  let out = [];

  // Convolve input with filter
  for (let row = 0; row < input.length - filter.length; row++) {
    let outRow = [];
    for (let col = 0; col < input[0].length - filter[0].length; col++) {
      // Find dot product at position
      let dotProd = 0;
      for (let filtRow = 0; filtRow < filter.length; filtRow++) {
        for (let filtCol = 0; filtCol < filter[0].length; filtCol++) {
          dotProd += filter[filtRow][filtCol] * input[row + filtRow][col + filtCol];
        }
      }
      outRow.push(dotProd);
    }
    out.push(outRow);
  }

  return out;
}

export function pool(input, sx, sy, poolingType) {
  switch (poolingType) {
    case "max": {
      let out = [];

      for (let row = 0; row < input.length; row += sy) {
        let outRow = [];
        for (let col = 0; col < input[0].length; col += sx) {
          // Find max at position
          let max = input[row][col];
          for (let kernalRow = 0; kernalRow < sy; kernalRow++) {
            for (let kernalCol = 0; kernalCol < sx; kernalCol++) {
              if (row + kernalRow >= input[0].length || col + kernalCol >= input.length) continue;
              if (input[row + kernalRow][col + kernalCol] > max) {
                max = input[row + kernalRow][col + kernalCol];
              }
            }
          }
          outRow.push(max);
        }
        out.push(outRow);
      }

      return out;
    }

    default: {
      console.log("Invalid pooling type");
      return;
    }
  }
}

export function relu(input) {
  return input.map((row) => row.map((value) => (value < 0 ? 0 : value)));
}

export function map(value, l, u, nL, nU) {
  return ((value - l) * (nU - nL)) / (u - l) + nL;
}

export function scaleImage(image, sf) {
  let out = [];

  const stride = 1 / sf;
  for (let row = 0; row < image.length; row += stride) {
    let outRow = [];
    for (let col = 0; col < image[0].length; col += stride) {
      outRow.push(image[~~row][~~col]);
    }
    out.push(outRow);
  }
  return out;
}

export function randomizeWeightMatrix(fullConnecter, l, u) {
  fullConnecter.weightMatrix.forEach((output) =>
    output.forEach((weight, i) => (output[i] = Math.random() * (u - l) + l))
  );
}

export function randomizeFilters(convolver, l, u) {
  convolver.filters.forEach((filter) =>
    filter.forEach((row) => row.forEach((weight, i) => (row[i] = Math.random() * (u - l) + l)))
  );
}

export function generateMatrix(width, height, initVal) {
  let out = [];

  for (let row = 0; row < height; row++) {
    let outRow = [];
    for (let col = 0; col < width; col++) outRow.push(initVal);
    out.push(outRow);
  }

  return out;
}