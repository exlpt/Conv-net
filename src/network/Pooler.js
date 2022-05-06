import * as util from "../util.js";

export default class Pooler {
  // Constructors
  constructor(sx, sy, poolingType) {
    this.sx = sx;
    this.sy = sy;
    this.poolingType = poolingType;
  }

  // Public members
  output = [];

  // Public methods
  calculate(inputs) {
    this.output = inputs.map((input) => util.pool(input, this.sx, this.sy, this.poolingType));
    return this.output;
  }
}
