import * as util from "../util.js";

export default class Convolver {
  // Constructors
  constructor(...filters) {
    this.filters = filters;
  }

  // Public members
  output = [];

  // Public methods
  calculate(inputs) {
    this.output = [];

    inputs.forEach((input) =>
      this.filters.forEach((filter) => this.output.push(util.convolve(input, filter)))
    );

    return this.output;
  }
}
