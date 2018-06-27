export type LogLevel = "error" | "warn" | "info" | "verbose" | "debug" |
  "silly";
export type LevelOption = LogLevel | false;

export type IFormat = (msg: ILogMessage) => void;
export type FOpenFlags = "r" | "r+" | "rs+" | "w" | "wx" | "w+" | "wx+" |
  "a" | "ax" | "a+" | "ax+";

export interface ILogMessage {
  data: any[];
  date: Date;
  level: LogLevel;
}

export declare interface ITransport {
  (msg: ILogMessage): void;
  level: LevelOption;
}

export interface IConsoleTransport extends ITransport {
  format: IFormat | string;
}

export interface IFileTransport extends ITransport {
  appName?: string;
  file?: string;
  format: IFormat | string;
  maxSize: number;
  stream: any;
  streamConfig?: {
    flags?: FOpenFlags;
    encoding?: string;
    fd?: number;
    mode?: number;
    autoClose?: boolean;
    start?: number;
  };
  findLogPath(appName?: string): string;
}

export interface ILogSTransport extends ITransport {
  client: object;
  depth: number;
  url?: string;
}

declare interface ITransports {
  console: IConsoleTransport;
  file: IFileTransport;
  logS: ILogSTransport;
  rendererConsole: IConsoleTransport;
  [key: string]: ITransport;
}

declare interface IElectronLog {
  transports: ITransports;
  error(...params: any[]): void;
  warn(...params: any[]): void;
  info(...params: any[]): void;
  verbose(...params: any[]): void;
  debug(...params: any[]): void;
  silly(...params: any[]): void;
  log(...params: any[]): void;
}

export declare function error(...params: any[]): void;
export declare function warn(...params: any[]): void;
export declare function info(...params: any[]): void;
export declare function verbose(...params: any[]): void;
export declare function debug(...params: any[]): void;
export declare function silly(...params: any[]): void;
export declare function log(...params: any[]): void;
export declare const transports: ITransports;

declare const _d: IElectronLog;
export default _d;
