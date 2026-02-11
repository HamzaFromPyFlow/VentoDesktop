// WebSocket wrapper for Vento - simplified version for desktop

export type VentoWsOptions = {
  url: string;
  recordingId: string;
  token: string;
  version?: string;
  rewindStartTime?: number;
  isCamera?: boolean;
  selectionRegion?: string;
  mode?: string;
  debug?: boolean;
  isFilter?: boolean;
  videoScale?: string;
  isPaid?: boolean;
  sig?: string;
  reconnection?: boolean;
  reconnectionAttempts?: number;
};

type Handler = (payload: any, ...args: any[]) => void;

export class VentoWS {
  private ws?: WebSocket;
  private handlers = new Map<string, Handler[]>();
  private opts: VentoWsOptions;

  constructor(opts: VentoWsOptions) {
    this.opts = {
      reconnection: opts.reconnection ?? false,
      reconnectionAttempts: opts.reconnectionAttempts ?? Infinity,
      ...opts,
    };
  }

  private url(): string {
    const p = new URLSearchParams({
      recordingId: this.opts.recordingId,
      token: this.opts.token,
      version: this.opts.version ?? "",
      isCamera: this.opts.isCamera ? "true" : "false",
      selectionRegion: this.opts.selectionRegion ?? "",
      mode: this.opts.mode ?? "",
      debug: this.opts.debug ? "true" : "false",
      isFilter: this.opts.isFilter ? "true" : "false",
      videoScale: this.opts.videoScale ?? "",
      isPaid: this.opts.isPaid ? "true" : "false",
      sig: this.opts.sig ?? "",
    });

    return `${this.opts.url}?${p.toString()}`;
  }

  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    this.ws = new WebSocket(this.url());

    this.ws.onopen = () => {
      console.log("VentoWS connected");
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const handlers = this.handlers.get(data.type) || [];
        handlers.forEach(handler => handler(data.payload));
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    this.ws.onerror = (error) => {
      console.error("VentoWS error:", error);
    };

    this.ws.onclose = () => {
      console.log("VentoWS disconnected");
      if (this.opts.reconnection) {
        // Implement reconnection logic if needed
      }
    };
  }

  on(type: string, handler: Handler): void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, []);
    }
    this.handlers.get(type)!.push(handler);
  }

  off(type: string, handler: Handler): void {
    const handlers = this.handlers.get(type);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  send(type: string, payload: any): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, payload }));
    }
  }

  disconnect(): void {
    this.opts.reconnection = false;
    this.ws?.close();
  }
}
