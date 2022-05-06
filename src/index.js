import * as util from "./util.js";
import * as render from "./dom/render.js";
import * as draw from "./dom/draw.js";
import * as trainer from "./trainer/trainer.js";

import Convolver from "./network/Convolver.js";
import Pooler from "./network/Pooler.js";
import Activator from "./network/Activator.js";
import FullConnecter from "./network/FullConnecter.js";
import Network from "./network/Network.js";
import Flattener from "./network/Flattener.js";

// Initialize drawing thing
const drawingCanvas = document.querySelector(".drawing");
draw.init(drawingCanvas, document.querySelector(".clear-drawing"));

// Create network
const network = new Network(
  new Convolver(
    util.generateMatrix(3, 3, 0),
    util.generateMatrix(3, 3, 0),
    util.generateMatrix(3, 3, 0),
    util.generateMatrix(3, 3, 0)
  ),
  new Pooler(2, 2, "max"),
  new Activator("relu"),

  new Flattener(),
  new FullConnecter(util.generateMatrix(24 * 24 * 4, 10, 0))
);

util.randomizeFilters(network.layers[0], -3, 3);
util.randomizeWeightMatrix(network.layers[4], -3, 3);

const networkContainer = document.querySelector(".network");
render.addNetworkToDOM(network, networkContainer);

// Add event listeners
document.addEventListener("keydown", (event) => {
  if (event.key === "q") {
    const raw = render.grabRedChannel(drawingCanvas);
    const scaled = util.scaleImage(raw, 1 / 6);
    const mapped = render.mapImage(scaled, 1, -1);
    const networkOutput = network.calculate(mapped);

    render.renderNetwork(network, networkContainer);
  } else if (event.key === "t") trainNetwork();
});

function trainNetwork() {
  const graph = document.querySelector(".graph");
  const graphCtx = graph.getContext("2d");
  const itterationCount = 50;
  const batchSize = 4;
  let costsSame = 0;
  let learningRate = 0.001;

  fetch("./trainingData.json")
    .then((res) => res.json())
    .then((json) => {
      // Init for data
      let lastCosts = [];
      for (let exampleInd = 0; exampleInd < 100; exampleInd += 10) {
        const netOut = network.calculate(util.scaleImage(json[exampleInd].input, 0.5));
        lastCosts.push(trainer.cost(netOut, json[exampleInd].output));
      }

      // Graph
      graph.width = parseInt(getComputedStyle(graph).width);
      graph.height = parseInt(getComputedStyle(graph).height);
      const graphSf = graph.height / lastCosts.reduce((max, cost) => (cost > max ? cost : max), 0) / 2;
      const step = graph.width / itterationCount;
      graphCtx.lineWidth = 1;
      graphCtx.beginPath();

      let i = 0;
      while (
        i < itterationCount
        //true
        //!lastCosts.every((cost) => cost < 0.1)
      ) {
        // Prepare batch
        let batch = [];
        let takenExamples = [];
        for (let a = 0; a < batchSize; a++) {
          let desiredIndex = ~~(Math.random() * 100);
          while (takenExamples.some((exampleInd) => exampleInd === desiredIndex)) {
            desiredIndex = ~~(Math.random() * 100);
          }

          takenExamples.push(desiredIndex);
          batch.push(json[desiredIndex]);
        }
        batch = batch.map((example) => ({
          input: util.scaleImage(example.input, 0.5),
          output: example.output,
        }));

        // Training step
        const batchGradient = trainer.computeBatchGradient(network, batch, learningRate);
        trainer.applyGradient(network, batchGradient);

        // Log data
        let netCosts = [];
        for (let exampleInd = 0; exampleInd < 100; exampleInd += 10) {
          const netOut = network.calculate(util.scaleImage(json[exampleInd].input, 0.5));
          netCosts.push(trainer.cost(netOut, json[exampleInd].output));
        }
        console.log(`Itteration ${i + 1} costs:`, netCosts);
        //console.log(`Diff:`, lastCosts[0] - netCosts[0]);

        // Graph data
        netCosts.forEach((cost, costInd) => {
          graphCtx.moveTo(i * step, graph.height - lastCosts[costInd] * graphSf);
          graphCtx.lineTo((i + 1) * step, graph.height - cost * graphSf);
          graphCtx.stroke();
        });

        // Dynamic learningRate
        //learningRate = Math.pow(2.5 - netCosts.reduce((rate, cost, ind) => rate + cost, 0) / netCosts.length / 4, 5) / 1000;

        // if (netCosts.every((cost, ind) => cost === 1)) costsSame++;
        // if (netCosts.every((cost, ind) => cost < 1)) learningRate = 0.0001;
        // if (netCosts.every((cost, ind) => cost < 0.1)) break;
        // if (costsSame === 30) {
        //   //util.randomizeFilters(network.layers[0], -3, 3);
        //   //util.randomizeWeightMatrix(network.layers[4], -3, 3);
        //   learningRate < 1 && console.log("===================\nLEARNING RATE = 1\n===================");
        //   learningRate = 1;
        //   costsSame = 0;
        // }

        lastCosts = [...netCosts];
        i++;
      }
      console.log(network);
      graphCtx.closePath();
    });
}
