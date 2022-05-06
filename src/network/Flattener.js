export default class Flattener {
  // Constructors

  // Public members
  output = [];

  // Public methods
  calculate(inputs) {
    this.output = [];
    inputs.forEach((input) => input.forEach((row) => row.forEach((value) => this.output.push(value))));
    return this.output;
  }
}
