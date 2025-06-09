
export function drawTrendGraph(data: number[]) {
  const canvas = document.getElementById("trend-canvas") as HTMLCanvasElement;
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
  ctx.moveTo(0, canvas.height - data[0]);

  for (let i = 1; i < data.length; i++) {
    ctx.lineTo(i * (canvas.width / data.length), canvas.height - data[i]);
  }

  ctx.strokeStyle = "#00ccff";
  ctx.stroke();
}
