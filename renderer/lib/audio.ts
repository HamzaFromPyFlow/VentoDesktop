// Note: Requires lodash - install with: npm install lodash @types/lodash

export async function playAudio(url: string, gainValue = 0.5, callback: (() => void) | null = null) {
  // Check if we're in Electron - audio playback can cause crashes during recording setup
  const isElectron = window.navigator.userAgent.includes('Electron');
  
  try {
    var AudioContext =
      window?.AudioContext || // Default
      (window as any)?.webkitAudioContext || // Safari fallback
      false;

    if (!AudioContext) {
      console.warn('[playAudio] Web Audio API is not supported');
      if (callback) {
        callback();
      }
      return;
    }

    // In Electron, delay audio playback slightly to avoid conflicts with recording AudioContext
    if (isElectron) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Create AudioContext with error handling for Electron
    let context: AudioContext;
    try {
      context = new AudioContext();
    } catch (err) {
      console.error('[playAudio] Failed to create AudioContext:', err);
      if (callback) {
        callback();
      }
      return;
    }

    // Resume AudioContext if suspended (required in some browsers/Electron)
    if (context.state === 'suspended') {
      try {
        await context.resume();
      } catch (err) {
        console.warn('[playAudio] Failed to resume AudioContext:', err);
        // If resume fails, close context and return early
        try {
          await context.close();
        } catch (closeErr) {
          // Ignore close errors
        }
        if (callback) {
          callback();
        }
        return;
      }
    }

    let gainNode;
    try {
      gainNode = context.createGain();
      gainNode.connect(context.destination);
      gainNode.gain.value = gainValue;
    } catch (err) {
      console.error('[playAudio] Error creating gain node:', err);
      try {
        await context.close();
      } catch (closeErr) {
        // Ignore close errors
      }
      if (callback) {
        callback();
      }
      return;
    }

    try {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Failed to fetch audio: ${res.status} ${res.statusText}`);
      }
      const buffer = await res.arrayBuffer();

      context.decodeAudioData(
        buffer,
        (audioBuffer) => {
          try {
            const source = context.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(gainNode);
            
            // Set up error handler before starting
            source.onended = () => {
              try {
                if (callback) {
                  callback();
                }
              } catch (callbackErr) {
                console.error('[playAudio] Error in callback:', callbackErr);
              }
              // Clean up context after playback
              try {
                if (context.state !== 'closed') {
                  context.close().catch(() => {
                    // Ignore close errors
                  });
                }
              } catch (closeErr) {
                // Ignore close errors
              }
            };
            
            source.onerror = (err) => {
              console.error('[playAudio] Audio source error:', err);
              try {
                if (callback) {
                  callback();
                }
              } catch (callbackErr) {
                // Ignore callback errors
              }
              try {
                if (context.state !== 'closed') {
                  context.close().catch(() => {
                    // Ignore close errors
                  });
                }
              } catch (closeErr) {
                // Ignore close errors
              }
            };
            
            source.start(0);
          } catch (err) {
            console.error('[playAudio] Error creating/starting audio source:', err);
            try {
              if (context.state !== 'closed') {
                context.close().catch(() => {
                  // Ignore close errors
                });
              }
            } catch (closeErr) {
              // Ignore close errors
            }
            if (callback) {
              callback();
            }
          }
        },
        (err) => {
          console.error('[playAudio] Error decoding audio data:', err);
          try {
            if (context.state !== 'closed') {
              context.close().catch(() => {
                // Ignore close errors
              });
            }
          } catch (closeErr) {
            // Ignore close errors
          }
          if (callback) {
            callback();
          }
        }
      );
    } catch (err) {
      console.error('[playAudio] Error fetching/decoding audio:', err);
      try {
        if (context.state !== 'closed') {
          context.close().catch(() => {
            // Ignore close errors
          });
        }
      } catch (closeErr) {
        // Ignore close errors
      }
      if (callback) {
        callback();
      }
    }
  } catch (err) {
    console.error('[playAudio] Unexpected error:', err);
    if (callback) {
      callback();
    }
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
