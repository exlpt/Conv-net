import * as util from "../util.js";

export default class Activator {
  // Constructors
  constructor(activationType) {
    this.activationType = activationType;
  }

  // Public members
  output = [];

  // Public methods
  calculate(inputs) {
    switch (this.activationType) {
      case "relu": {
        this.output = inputs.map((input) => util.relu(input));
				break;
      }

      default: {
				this.output = inputs;
        console.log("Invalid activation type!");
      }
    }

    return this.output;
  }
}
