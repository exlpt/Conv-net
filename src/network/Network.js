import Flattener from "./Flattener.js";
import FullConnecter from "./FullConnecter.js";

export default class Network {
  // Constructors
  constructor(...layers) {
    // Architecture validation
    let fullConsValid = true;
    let flattenerCount = 0;
    for (let i = 0; i < layers.length; i++) {
      // Flattener count
      if (layers[i] instanceof Flattener) flattenerCount++;

      // FullConnecter input
      if (
        layers[i] instanceof FullConnecter &&
        !(layers[i - 1] instanceof FullConnecter || layers[i - 1] instanceof Flattener)
      ) {
        fullConsValid = false;
        break;
      }
    }

    if (fullConsValid && flattenerCount === 1) this.layers = layers;
    else {
      this.layers = [];
      console.log(
        `Network architecture invalid, ${
          fullConsValid
            ? `invalid flattener count: ${flattenerCount}`
            : "layer before 1 or more FullConectors is not a FullConnecter or Flattener."
        }`
      );
    }
  }

  // Public members
  output = [];
	input = [];

  // Public methods
  calculate(input) {
		this.input = input;

    if (this.layers.length === 0) {
      this.output = input;
      return this.output;
    }

    this.output = this.layers.reduce((layerOutput, layer) => layer.calculate(layerOutput), [input]);
    return this.output;
  }
}
