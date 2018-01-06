export type LogLevel = "error" | "warn" | "info" | "verbose" | "debug" |
  "silly";
export type LevelOption = LogLevel | false;

export type IFormat = (msg: ILogMessage) => void;
export type FOpenFlags = "r" | "r+" | "rs+" | "w" | "wx" | "w+" | "wx+" |
  "a" | "ax" | "a+" | "ax+";

export declare interface ITransport {
  level: LevelOption;
  format: IFormat | string;
}

declare interface ITransports {
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

export interface ILogMessage {
  data: any[];
  date: Date;
}

export interface IConsoleTransport extends ITransport {
  (msg: ILogMessage): void;
}

export interface IFileTransport extends ITransport {
  (msg: ILogMessage): void;
  appName?: string;
  file?: string;
  maxSize: number;
  streamConfig?: {
    flags?: FOpenFlags;
    encoding?: string;
    fd?: number;
    mode?: number;
    autoClose?: boolean;
    start?: number;
  };
  findLogPath(appName: string): string;
}

export interface ILogSTransport extends ITransport {
  (msg: ILogMessage): void;
  client: object;
  depth: number;
  url?: string;
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
