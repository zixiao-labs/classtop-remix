export {};

declare global {
  interface Window {
    electronAPI: {
      platform: NodeJS.Platform;
      invoke: (channel: string, ...args: unknown[]) => Promise<unknown>;
      on: (channel: string, callback: (...args: unknown[]) => void) => () => void;
    };
  }
}
