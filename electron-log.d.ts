export type ILogLevel = "error" | "warn" | "info" | "verbose" | "debug" |
  "silly";
export type ILevelOption = ILogLevel | false;
export type ILevels = Array<ILogLevel | string>;

export type IFormat = (msg: ILogMessage) => void;

export type IFOpenFlags = "r" | "r+" | "rs+" | "w" | "wx" | "w+" | "wx+" |
  "a" | "ax" | "a+" | "ax+";

export type IHook = (
  msg: ILogMessage,
  selectedTransports?: ITransports,
) => ILogMessage | false;

export interface IVariables {
  [name: string]: any;
}

export interface ILogMessage {
  data: any[];
  date: Date;
  level: ILogLevel;
  styles: string[];
  variables?: IVariables;
}

export declare interface ITransport {
  (msg: ILogMessage): void;
  level: ILevelOption;
}

export interface IConsoleTransport extends ITransport {
  format: IFormat | string;
}

export interface IFileTransport extends ITransport {
  appName?: string;
  archiveLog: (oldLogPath: string) => void;
  bytesWritten: number;
  file?: string;
  fileName: string;
  format: IFormat | string;
  maxSize: number;
  sync: boolean;
  writeOptions?: {
    flag?: IFOpenFlags;
    mode?: number;
    encoding?: string;
  };
  clear();
  findLogPath(appName?: string, fileName?: string): string;
  init();
}

export interface IRemoteTransport extends ITransport {
  client: object;
  depth: number;
  url?: string;
}

declare interface ITransports {
  console: IConsoleTransport;
  file: IFileTransport;
  mainConsole?: ITransport;
  remote: IRemoteTransport;
  rendererConsole?: ITransport;
  [key: string]: ITransport;
}

declare interface IElectronLog {
  transports: ITransports;
  hooks: IHook[];
  levels: ILevels;
  variables: IVariables;

  error(...params: any[]): void;
  warn(...params: any[]): void;
  info(...params: any[]): void;
  verbose(...params: any[]): void;
  debug(...params: any[]): void;
  silly(...params: any[]): void;
  log(...params: any[]): void;
}

export declare const transports: ITransports;
export declare const hooks: IHook[];
export declare const levels: ILevels;
export declare const variables: IVariables;

export declare function error(...params: any[]): void;
export declare function warn(...params: any[]): void;
export declare function info(...params: any[]): void;
export declare function verbose(...params: any[]): void;
export declare function debug(...params: any[]): void;
export declare function silly(...params: any[]): void;
export declare function log(...params: any[]): void;

declare const _d: IElectronLog;
export default _d;
