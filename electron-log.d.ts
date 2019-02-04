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
  /**
   * Any arguments passed to a log function
   */
  data: any[];

  /**
   * When the log entry was created
   */
  date: Date;

  /**
   * From error to silly
   */
  level: ILogLevel;

  /**
   * CSS like strings, eg ["color: red"]
   */
  styles: string[];

  /**
   * Variables used by formatter
   */
  variables?: IVariables;
}

export declare interface ITransport {
  (msg: ILogMessage): void;

  /**
   * Messages with level lower than will be dropped
   */
  level: ILevelOption;
}

export interface IConsoleTransport extends ITransport {
  /**
   * String template of function for message serialization
   */
  format: IFormat | string;
}

export interface IFileTransport extends ITransport {
  /**
   * Determines a location of log file, something like
   * ~/.config/<app name>/log.log depending on OS. By default electron-log
   * reads this value from name or productName value in package.json. In most
   * cases you should keep a default value
   */
  appName?: string;

  /**
   * Function which is called on log rotation. You can override it if you need
   * custom log rotation behavior. This function should remove old file
   * synchronously
   */
  archiveLog: (oldLogPath: string) => void;

  /**
   * How much bytes were written since transport initialization
   */
  bytesWritten: number;

  /**
   * The full log file path. I can recommend to change this value only if
   * you strongly understand what are you doing. If set, appName and fileName
   * options are ignored
   */
  file?: string;

  /**
   * Filename without path, log.log by default
   */
  fileName: string;

  /**
   * String template of function for message serialization
   */
  format: IFormat | string;

  /**
   * Maximum size of log file in bytes, 1048576 (1mb) by default. When a log
   * file exceeds this limit, it will be moved to log.old.log file and the
   * current file will be cleared. You can set it to 0 to disable rotation
   */
  maxSize: number;

  /**
   * Whether to write a log file synchronously. Default to true
   */
  sync: boolean;

  /**
   * Options used when writing a file
   */
  writeOptions?: {
    /**
     * Default 'a'
     */
    flag?: IFOpenFlags;

    /**
     * Default 0666
     */
    mode?: number;

    /**
     * Default 'utf8'
     */
    encoding?: string;
  };

  /**
   * Clear the current log file
   */
  clear(): void;

  /**
   * Return full path of the current log file
   */
  findLogPath(appName?: string, fileName?: string): string;

  /**
   * In most cases, you don't need to call it manually. Try to call only if
   * you change appName, file or fileName property, but it has no effect.
   */
  init(): void;
}

export interface IRemoteTransport extends ITransport {
  /**
   * Client information which will be sent in each request together with
   * a message body
   */
  client?: object;

  /**
   * How deep to serialize complex objects
   */
  depth?: number;

  /**
   * Server URL
   */
  url: string;
}

declare interface ITransports {
  /**
   * Writes logs to console
   */
  console: IConsoleTransport;

  /**
   * Writes logs to a file
   */
  file: IFileTransport;

  /**
   * When logging inside renderer process, it shows log in application console
   * too. This transport can impact on performance, so it's disabled by default
   * for packaged application.
   */
  mainConsole: ITransport | null;

  /**
   * Sends a JSON POST request with ILogMessage in the body to the specified url
   */
  remote: IRemoteTransport;
  /**
   * When logging inside main process, it shows log in DevTools console too.
   * This transport can impact on performance, so it's disabled by default for
   * packaged application
   */
  rendererConsole: ITransport | null;

  [key: string]: ITransport | null;
}

declare interface ICatchErrorsOptions {
  /**
   * Default true for the main process. Set it to false to prevent showing a
   * default electron error dialog
   */
  showDialog?: boolean;

  /**
   * Attach a custom error handler. If the handler returns false, this error
   * will not be processed
   */
  onError?(error: Error): void;
}

declare interface IElectronLog {
  /**
   * Transport instances
   */
  transports: ITransports;

  /**
   * Array with all attached hooks
   */
  hooks: IHook[];

  /**
   * Array with all available levels
   */
  levels: ILevels;

  /**
   * Variables used by formatters
   */
  variables: IVariables;

  /**
   * Catch and log unhandled errors/rejected promises
   */
  catchErrors(options?: ICatchErrorsOptions): void | false;

  /**
   * Log an error message
   */
  error(...params: any[]): void;

  /**
   * Log a warning message
   */
  warn(...params: any[]): void;

  /**
   * Log an informational message
   */
  info(...params: any[]): void;

  /**
   * Log a verbose message
   */
  verbose(...params: any[]): void;

  /**
   * Log a debug message
   */
  debug(...params: any[]): void;

  /**
   * Log a silly message
   */
  silly(...params: any[]): void;

  /**
   * Shortcut to info
   */
  log(...params: any[]): void;
}

/**
 * Transport instances
 */
export declare const transports: ITransports;

/**
 * Array with all attached hooks
 */
export declare const hooks: IHook[];

/**
 * Array with all available levels
 */
export declare const levels: ILevels;

/**
 * Variables used by formatters
 */
export declare const variables: IVariables;

/**
 * Catch and log unhandled errors/rejected promises
 */
export declare function catchErrors(
    options?: ICatchErrorsOptions,
): void | false;

/**
 * Log an error message
 */
export declare function error(...params: any[]): void;

/**
 * Log a warning message
 */
export declare function warn(...params: any[]): void;

/**
 * Log an informational message
 */
export declare function info(...params: any[]): void;

/**
 * Log a verbose message
 */
export declare function verbose(...params: any[]): void;

/**
 * Log a debug message
 */
export declare function debug(...params: any[]): void;

/**
 * Log a silly message
 */
export declare function silly(...params: any[]): void;

/**
 * Shortcut to info
 */
export declare function log(...params: any[]): void;

declare const _d: IElectronLog;
export default _d;
