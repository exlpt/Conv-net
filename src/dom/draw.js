import * as render from "./render.js";

export function init(canvas, clearBtn) {
  // Init canvas
  const ctx = canvas.getContext("2d");
  canvas.width = 300;
  canvas.height = 300;
  render.clearCanvas(canvas);

  // Drawing
  const sf = [
    parseInt(window.getComputedStyle(canvas).width) / canvas.width,
    parseInt(window.getComputedStyle(canvas).height) / canvas.height,
  ];

  clearBtn.onclick = () => render.clearCanvas(canvas);

  ctx.lineWidth = 20;
  ctx.lineCap = "round";
  ctx.strokeStyle = "#000000";

  let drawing = false;
	let prevPos = [0, 0];
  canvas.addEventListener("mousedown", (event) => {
		drawing = true;
    const canvasRect = canvas.getBoundingClientRect();
		prevPos = [(event.clientX - canvasRect.left) / sf[0], (event.clientY - canvasRect.top) / sf[1]];
  });

  canvas.addEventListener("mouseup", () => {
    drawing = false;
    ctx.closePath();
  });

  canvas.addEventListener("mousemove", (event) => {
    if (drawing) {
      const canvasRect = canvas.getBoundingClientRect();
      const mousePos = [(event.clientX - canvasRect.left) / sf[0], (event.clientY - canvasRect.top) / sf[1]];

			ctx.beginPath();
			ctx.moveTo(...prevPos);
      ctx.lineTo(...mousePos);
      ctx.stroke();

			prevPos = [...mousePos];
    }
  });
}
