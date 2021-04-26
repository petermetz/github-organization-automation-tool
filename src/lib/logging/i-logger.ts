export type ILogger = {
  readonly trace: (message: string, meta: unknown) => Promise<void>;
  readonly debug: (message: string, meta: unknown) => Promise<void>;
  readonly info: (message: string, meta: unknown) => Promise<void>;
  readonly warn: (message: string, meta: unknown) => Promise<void>;
  readonly error: (message: string, meta: unknown) => Promise<void>;
};
