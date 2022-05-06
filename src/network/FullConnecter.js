import * as trainingUtil from "../trainer/trainerUtil.js";

export default class Pooler {
  // Constructors
  constructor(weightMatrix) {
    this.weightMatrix = weightMatrix;
  }

  // Public members
  output = [];

  // Public methods
  calculate(input) {
    // Incorrect weight matrix size
    if (this.weightMatrix[0].length !== input.length) {
      console.log("Incorrect weight matrix size!");
      this.output = [];
      for (let i = 0; i < this.weightMatrix.length; i++) this.output.push(0);
      return this.output;
    }

    this.z = this.weightMatrix.map((output) =>
      output.reduce((dotProd, weight, index) => dotProd + input[index] * weight, 0)
    );
    this.z1 = this.z.map((output) => trainingUtil.sigmoid(output));
    this.z1Sum = this.z1.reduce((result, out) => result + out, 0);
    this.a1 = this.z1.map((output) => output / this.z1Sum);

    this.output = [...this.a1];
    return this.output;
  }
}
