let canvas = document.getElementById('canvas');
let context = canvas.getContext('2d');
let x = undefined;
let y = undefined;
const maxIterations = 1028;
const colors = [];
let colorOffset = 0;
let colorCyclingOn = false;
let timeoutInterval =10;
let isDrawing = false;
let bitmap = [];
let startX = 0;
let startY = 0;
let currentA0 = -2, currentB0 = -1.5, currentA1 = 1, currentB1 = 1.5;
document.addEventListener("DOMContentLoaded", function () {
  context.fillStyle = '#444444';
  context.fillRect(0, 0, canvas.width, canvas.height);
  makeColors();
  console.log ('colors='+colors.length);
  drawMandelbrot(currentA0, currentB0, currentA1, currentB1);
  canvas.addEventListener('mousedown', onMouseDown);
  canvas.addEventListener('mousemove', onMouseMove);
  canvas.addEventListener('mouseup', onMouseUp);
});
function makeColors() {
  let r = 15;
  let b = 0;
  let g = 0;
  for (let g = 0; g < 16; g += 1) colors.push(makeColor(r, g, b));//red to yellow
  g = 15; b = 0;
  for (let r = 15; r >= 0; r -= 1) colors.push(makeColor(r, g, b));//yellow to green 
  g = 15; r = 0;
  for (let b = 0; b < 16; b += 1) colors.push(makeColor(r, g, b));// green to cyan
  b = 15; r = 0;
  for (let g = 15; g >= 0; g -= 1)colors.push(makeColor(r, g, b));// cyan to blue
  b = 15; g = 0;
  for (let r = 0; r < 16; r += 1) colors.push(makeColor(r, g, b)); //blue to "purple"
  r = 15; g = 0;
  for (let b = 15; b >= 0; b -= 1) colors.push(makeColor(r, g, b)); //blue to "purple"

}
function makeColor(r, g, b) {
  if (r == 0 && g == 0 && b == 0) alert('black?');
  return '#' + r.toString(16) + r.toString(16) + g.toString(16) + g.toString(16) + b.toString(16) + b.toString(16);
}
function onMouseDown(event) {
  if (event.button == 0) {
    isDrawing = true;
    const rect = canvas.getBoundingClientRect();
    startX = event.clientX - rect.left;
    startY = event.clientY - rect.top;
  }
}
function onMouseMove(event) {
  if (!isDrawing) return;

  const rect = canvas.getBoundingClientRect();
  const currentX = event.clientX - rect.left;
  const currentY = event.clientY - rect.top;
  if (bitmap.length > 0) { render() };
  context.strokeStyle = '#FFFFFF';
  context.lineWidth = 2;
  context.strokeRect(startX, startY, currentX - startX, currentY - startY);

}
function onMouseUp(event) {
  if (event.button == 0) {
    if (!isDrawing) return;

    isDrawing = false;

    const rect = canvas.getBoundingClientRect();
    const endX = event.clientX - rect.left;
    const endY = event.clientY - rect.top;
    let sX = (currentA1 - currentA0) / canvas.width;
    let sY = (currentB1 - currentB0) / canvas.height;

    let newA0 = currentA0 + Math.min(startX, endX) * sX;
    let newA1 = currentA0 + Math.max(startX, endX) * sX;
    let newB0 = currentB0 + Math.min(startY, endY) * sY;
    let newB1 = currentB0 + Math.max(startY, endY) * sY;

    // Maintain aspect ratio
    let newWidth = newA1 - newA0;
    let newHeight = newB1 - newB0;
    let canvasAspect = canvas.width / canvas.height;
    let selectedAspect = newWidth / newHeight;

    if (selectedAspect > canvasAspect) {
      // Selection is wider, expand height
      let targetHeight = newWidth / canvasAspect;
      let centerB = (newB0 + newB1) / 2;
      newB0 = centerB - targetHeight / 2;
      newB1 = centerB + targetHeight / 2;
    } else {
      // Selection is taller, expand width
      let targetWidth = newHeight * canvasAspect;
      let centerA = (newA0 + newA1) / 2;
      newA0 = centerA - targetWidth / 2;
      newA1 = centerA + targetWidth / 2;
    }

    currentA0 = newA0;
    currentA1 = newA1;
    currentB0 = newB0;
    currentB1 = newB1;
    drawMandelbrot(currentA0, currentB0, currentA1, currentB1);
  }
}
canvas.addEventListener('contextmenu', function (event) {
  // Prevent the default browser context menu from appearing
  event.preventDefault();
  colorCyclingOn = !colorCyclingOn;
  if (colorCyclingOn) colorCycle();
});

function colorCycle() {
  colorOffset++;
  if (colorOffset === colors.length) {
    colorOffset = 0;
  }
  render();
  if (colorCyclingOn) setTimeout(colorCycle, timeoutInterval);
}

function drawMandelbrot(a0, b0, a1, b1) {
  let sX = (a1 - a0) / canvas.width;
  let sY = (b1 - b0) / canvas.height;
  for (let x = 0; x < canvas.width; x++) {
    for (let y = 0; y < canvas.height; y++) {
      let a = a0 + x * sX;
      let b = b0 + y * sY;
      let result = calcPixel({ a: 0, b: 0 }, a, b, 0);
      bitmap[x + y * canvas.width] = result;
    }
  }
  render();
}

function calcPixel(z, a, b, iteration) {
  let magnitude = Math.sqrt(z.a ** 2 + z.b ** 2);
  if (magnitude <= 2) {
    if (iteration === maxIterations) {
      return iteration;
    }
    let zsqr = { a: z.a ** 2 - z.b ** 2, b: 2 * z.a * z.b };
    let nz = { a: zsqr.a + a, b: zsqr.b + b }
    return calcPixel(nz, a, b, iteration + 1);
  } else {
    return iteration;
  }
}
function render() {
  let t = Date.now();
  for (let x = 0; x < canvas.width; x++) {
    for (let y = 0; y < canvas.height; y++) {
      drawPixel(x, y, bitmap[x + y * canvas.width]);
    }
  }
  let dt=Date.now()-t; 
  
  if (dt>timeoutInterval) {
    timeoutInterval =dt*1.1;
  }
}
function drawPixel(x, y, itr) {
  let colorValue = undefined;
  let colorNumber = itr + colorOffset;
  while (colorNumber > colors.length) colorNumber = colorNumber - colors.length;
  colorValue = colors[colorNumber];
  if (itr === maxIterations) colorValue = '#000000';
  context.fillStyle = colorValue;
  context.fillRect(x, y, 1, 1);
}