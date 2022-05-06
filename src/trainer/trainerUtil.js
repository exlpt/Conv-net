export function sigmoid(x) {
  return 1 / (1 + Math.exp(-x));
}

export function dSigmoid(x) {
  return sigmoid(x) * (1 - sigmoid(x));
}

export function cost(x, y) {
  return Math.pow(x - y, 2);
}

export function dCost(x, y) {
  return 2 * (x - y);
}

export function crossEntropy(q, p) {
  return p * Math.log(q === 0 ? 0.00001 : q);
}

export function dCrossEntropy(pred, y) {
  return y.reduce((sum, label, ind) => (label / pred[ind] === 0 ? 0.00001 : pred[ind]));
}
