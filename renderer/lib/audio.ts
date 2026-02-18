// Note: Requires lodash - install with: npm install lodash @types/lodash

export async function playAudio(url: string, gainValue = 0.5, callback: (() => void) | null = null) {
  var AudioContext =
    window?.AudioContext || // Default
    false;

  if (AudioContext) {
    const context = new AudioContext();
    const gainNode = context.createGain();
    gainNode.connect(context.destination);

    gainNode.gain.value = gainValue;

    try {
      const res = await fetch(url);
      const buffer = await res.arrayBuffer();

      context.decodeAudioData(buffer, (audioBuffer) => {
        const source = context.createBufferSource();
        source.buffer = audioBuffer;

        source.connect(gainNode);
        source.start(0);

        source.onended = () => {
          if (callback) {
            callback()
          }
        }
      });
    } catch (err) {
      console.warn(err);
    }
  } else {
    // Web Audio API is not supported
    // Alert the user
    console.log(
      "Sorry, but the Web Audio API is not supported by your browser. Please, consider upgrading to the latest version or downloading Google Chrome or Mozilla Firefox"
    );
  }
}

// https://css-tricks.com/making-an-audio-waveform-visualizer-with-vanilla-javascript/
// Aligned with vento web: no url = draw empty canvas (no AudioContext, no crash).
export async function visualizeAudio(
  canvas: HTMLCanvasElement,
  totalVideoDuration: number,
  url?: string | null,
  signal?: AbortSignal
) {
  if (totalVideoDuration === 0 || !canvas) {
    draw([], canvas);
    return;
  }

  if (!url) {
    draw([], canvas);
    return;
  }

  const AudioContextClass =
    window?.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

  if (!AudioContextClass) {
    draw([], canvas);
    return;
  }

  const context = new AudioContextClass();

  try {
    const res = await fetch(url, { signal });
    const buffer = await res.arrayBuffer();
    const audioBuffer = await context.decodeAudioData(buffer);
    const normalizedData = normalizeData(filterData(audioBuffer, totalVideoDuration));
    draw(normalizedData, canvas);
  } catch (err) {
    if ((err as Error).name !== 'AbortError') {
      console.error('Audio visualization error:', err);
    }
    draw([], canvas);
  } finally {
    if (context.state !== 'closed') {
      await context.close();
    }
  }
}

// Safe for Electron: guard zero-width canvas to avoid renderer crash (Exit Code 11).
function draw(normalizedData: number[], canvas: HTMLCanvasElement) {
  if (!canvas || canvas.offsetWidth === 0) return;

  const dpr = window.devicePixelRatio || 1;
  const width = canvas.offsetWidth;
  const height = canvas.offsetHeight;

  canvas.width = width * dpr;
  canvas.height = height * dpr;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, width, height);
  ctx.translate(0, height / 2);

  if (normalizedData.length === 0) return;

  const barWidth = width / normalizedData.length;
  for (let i = 0; i < normalizedData.length; i++) {
    const x = barWidth * i;
    const barHeight = Math.max(1, normalizedData[i] * height * 0.8);
    drawBars(ctx, x, barWidth, barHeight);
  }
}

function drawBars(
  ctx: CanvasRenderingContext2D,
  x: number,
  width: number,
  height: number
) {
  const gap = 0;

  ctx.fillStyle = "white";
  ctx.fillRect(x, -height / 2, width - gap, height);
}

/**
 * Reduce the amount of data we're working with by applying a filter
 */
function filterData(audioBuffer: AudioBuffer, videoDuration:number) {
  const rawData = audioBuffer.getChannelData(0); // We only need to work with one channel of data
  const durationInSec = Math.floor(videoDuration/1000);
  let samples = 0; // Number of samples we want to have in our final data set, this value and gap determines the width of the visualization
  if (durationInSec <= 300) {
    samples = durationInSec * 10;
  } else if (durationInSec >= 300  && durationInSec <= 600) {
    samples = durationInSec * 5;
  } else {
    samples = durationInSec * 3;
  }
  if (samples <= 250) {
    samples = 250;
  } else if (samples > 10000) {
    samples = 10000;
  } 
  console.log("Samples", samples);
  const blockSize = Math.floor(rawData.length / samples); // the number of samples in each subdivision
  const filteredData = [];

  for (let i = 0; i < samples; i++) {
    let blockStart = blockSize * i; // the location of the first sample in the block
    let sum = 0;
    // Find the average of the samples
    for (let j = 0; j < blockSize; j++) {
      sum = sum + Math.abs(rawData[blockStart + j]); // find the sum of all the samples in the block
    }
    filteredData.push(sum / blockSize); // divide the sum by the block size to get the average
  }

  return filteredData;
}
/**
 * Normalize to 0–1 scale. Uses a loop instead of Math.max(...arr) to avoid
 * stack overflow on large arrays (~100k+ elements) on macOS.
 */
function normalizeData(filteredData: number[]) {
  if (filteredData.length === 0) return [];

  let max = 0;
  for (let i = 0; i < filteredData.length; i++) {
    if (filteredData[i] > max) max = filteredData[i];
  }
  if (max === 0) return filteredData;

  const multiplier = 1 / max;
  return filteredData.map((n) => n * multiplier);
}
