/**
 * Draws a simple line graph for an array of numeric points.
 * Scales data dynamically to fit canvas height, adds grid lines and axes.
 *
 * <canvas id="trend-canvas" width="600" height="200"></canvas>
 */
export function drawTrendGraph(data: number[]): void {
  const canvas = document.getElementById("trend-canvas") as HTMLCanvasElement | null
  if (!canvas) return

  const ctx = canvas.getContext("2d")
  if (!ctx || data.length === 0) return

  /* ---------------------------------- Setup ---------------------------------- */

  const { width, height } = canvas
  const padding = 24
  const plotW = width - padding * 2
  const plotH = height - padding * 2

  const maxVal = Math.max(...data)
  const minVal = Math.min(...data)

  /* Map data point -> canvas coordinate */
  const xStep = plotW / (data.length - 1 || 1)
  const yScale = maxVal === minVal ? 1 : plotH / (maxVal - minVal)
  const toY = (val: number) => height - padding - (val - minVal) * yScale

  ctx.clearRect(0, 0, width, height)

  /* ----------------------------------- Grid ---------------------------------- */

  ctx.strokeStyle = "#242424"
  ctx.lineWidth = 1
  ctx.setLineDash([4, 4])

  // horizontal grid
  for (let i = 0; i <= 4; i++) {
    const y = padding + (plotH * i) / 4
    ctx.beginPath()
    ctx.moveTo(padding, y)
    ctx.lineTo(width - padding, y)
    ctx.stroke()
  }

  // vertical grid
  for (let i = 0; i < data.length; i += Math.ceil(data.length / 8)) {
    const x = padding + i * xStep
    ctx.beginPath()
    ctx.moveTo(x, padding)
    ctx.lineTo(x, height - padding)
    ctx.stroke()
  }

  ctx.setLineDash([])

  /* ---------------------------------- Line ----------------------------------- */

  ctx.beginPath()
  ctx.moveTo(padding, toY(data[0]))

  for (let i = 1; i < data.length; i++) {
    ctx.lineTo(padding + i * xStep, toY(data[i]))
  }

  ctx.strokeStyle = "#00ccff"
  ctx.lineWidth = 2
  ctx.stroke()

  /* --------------------------------- Axes ------------------------------------ */

  ctx.strokeStyle = "#888"
  ctx.lineWidth = 1

  // Y-axis
  ctx.beginPath()
  ctx.moveTo(padding, padding)
  ctx.lineTo(padding, height - padding)
  ctx.stroke()

  // X-axis
  ctx.beginPath()
  ctx.moveTo(padding, height - padding)
  ctx.lineTo(width - padding, height - padding)
  ctx.stroke()
}
