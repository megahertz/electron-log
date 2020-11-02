import { RequestOptions } from 'http';
import { InspectOptions } from 'util';

declare namespace ElectronLog {
  type LogLevel = 'error' | 'warn' | 'info' | 'verbose' | 'debug' |
    'silly';
  type LevelOption = LogLevel | false;
  type Levels = Array<LogLevel | string> & {
    add(name: string, index?: number): void
  };

  type Format = (message: LogMessage, transformedData?: any[]) => any[] | string;

  type FopenFlags = 'r' | 'r+' | 'rs+' | 'w' | 'wx' | 'w+' | 'wx+' |
    'a' | 'ax' | 'a+' | 'ax+';

  type Hook = (
    message: LogMessage,
    selectedTransport?: Transport,
  ) => LogMessage | false;

  interface Variables {
    [name: string]: any;
  }

  interface LogMessage {
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
    level: LogLevel;

    /**
     * Message scope label
     */
    scope?: string;

    /**
     * Variables used by formatter
     */
    variables?: Variables;
  }

  interface Transport {
    (message: LogMessage): void;

    /**
     * Messages with level lower than will be dropped
     */
    level: LevelOption;
  }

  interface ConsoleTransport extends Transport {
    /**
     * String template of function for message serialization
     */
    format: Format | string;

    /**
     * Use styles even if TTY isn't attached
     */
    useStyles: boolean;
  }

  interface PathVariables {
    /**
     * Per-user application data directory, which by default points to:
     * %APPDATA% on Windows
     * $XDG_CONFIG_HOME or ~/.config on Linux
     * ~/Library/Application Support on macOS
     */
    readonly appData: string;

    /**
     * Application name from productName or name of package.json
     */
    readonly appName: string;

    /**
     * Application version from package.json
     */
    readonly appVersion: string;

    /**
     * app.getPath('logs'). May be unavailable in old versions
     */
    readonly electronDefaultDir?: string;

    /**
     * Name of the log file without path
     */
    readonly fileName?: string;

    /**
     * User's home directory
     */
    readonly home: string;

    /**
     * userData + /logs/ + fileName on Linux and Windows
     * ~/Library/Logs/ + appName + / + fileName on macOS
     */
    readonly libraryDefaultDir: string;

    /**
     * Same as libraryDefaultDir, but contains '{appName}' template instead
     * of the real application name
     */
    readonly libraryTemplate: string;

    /**
     * OS temporary path
     */
    readonly tempDir: string;

    /**
     * The directory for storing your app's configuration files, which by
     * default it is the appData directory appended with your app's name.
     */
    readonly userData: string;
  }

  interface WriteOptions {
    /**
     * Default 'a'
     */
    flag?: FopenFlags;

    /**
     * Default 0666
     */
    mode?: number;

    /**
     * Default 'utf8'
     */
    encoding?: string;
  }

  interface LogFile {
    /**
     * Full log file path
     */
    readonly path: string;

    /**
     * How many bytes were written since transport initialization
     */
    readonly bytesWritten: number;

    /**
     * Current file size
     */
    readonly size: number;

    /**
     * Clear the log file
     */
    clear (): boolean;

    /**
     * Emitted when there was some error while saving log file
     */
    on (event: 'error', listener: (error: Error, file: this) => void): this;
  }

  interface FileTransport extends Transport {
    /**
     * Determines a location of log file, something like
     * ~/.config/<app name>/log.log depending on OS. By default electron-log
     * reads this value from name or productName value in package.json. In most
     * cases you should keep a default value
     * @deprecated
     */
    appName?: string;

    /**
     * Function which is called on log rotation. You can override it if you need
     * custom log rotation behavior. This function should remove old file
     * synchronously
     */
    archiveLog: (oldLogPath: string) => void;

    /**
     * How many bytes were written since transport initialization
     * @deprecated
     */
    bytesWritten: number;

    /**
     * How deep to serialize complex objects
     * Deprecated in favor of inspectOptions
     * @deprecated
     */
    depth: number;

    /**
     * The full log file path. I can recommend to change this value only if
     * you strongly understand what are you doing. If set, appName and fileName
     * options are ignored
     * @deprecated
     */
    file?: string;

    /**
     * Filename without path, main.log (or renderer.log) by default
     */
    fileName: string;

    /**
     * String template of function for message serialization
     */
    format: Format | string;

    /**
     * Return the current log file instance
     * You only need to provide message argument if you define log path inside
     * resolvePath callback depending on a message.
     */
    getFile (message?: Partial<LogMessage>): LogFile;

    /**
     * Serialization options
     * @link https://nodejs.org/api/util.html#util_util_inspect_object_options
     */
    inspectOptions: InspectOptions;

    /**
     * Maximum size of log file in bytes, 1048576 (1mb) by default. When a log
     * file exceeds this limit, it will be moved to log.old.log file and the
     * current file will be cleared. You can set it to 0 to disable rotation
     */
    maxSize: number;

    /**
     * Reads content of all log files
     */
    readAllLogs(): Array<{ path: string, lines: string[] }>;

    /**
     * Allow to change log file path dynamically
     */
    resolvePath: (variables: PathVariables, message?: LogMessage) => string;

    /**
     * Whether to write a log file synchronously. Default to true
     */
    sync: boolean;

    /**
     * Options used when writing a file
     */
    writeOptions?: WriteOptions;

    /**
     * Clear the current log file
     * @deprecated
     */
    clear (): void;

    /**
     * Return full path of the current log file
     * @deprecated
     */
    findLogPath (appName?: string, fileName?: string): string;

    /**
     * In most cases, you don't need to call it manually. Try to call only if
     * you change appName, file or fileName property, but it has no effect.
     * @deprecated
     */
    init (): void;
  }

  interface RemoteTransport extends Transport {
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
     * Additional options for the HTTP request
     */
    requestOptions?: RequestOptions;

    /**
     * Callback which transforms request body to string
     */
    transformBody?: (data: LogMessage & { client: object }) => string;

    /**
     * Server URL
     */
    url: string;
  }

  interface Transports {
    /**
     * Writes logs to console
     */
    console: ConsoleTransport;

    /**
     * Writes logs to a file
     */
    file: FileTransport;

    /**
     * When logging inside renderer process, it shows log in application
     * console too and vice versa. This transport can impact on performance,
     * so it's disabled by default for packaged application.
     */
    ipc: Transport | null;

    /**
     * Sends a JSON POST request with LogMessage in the body to the specified url
     */
    remote: RemoteTransport;

    [key: string]: Transport | null;
  }

  interface Scope {
    (label: string): LogFunctions;

    /**
     * Label for log message without scope. False value disables padding
     * when labelPadding is enabled.
     */
    defaultLabel: string | false;

    /**
     * Pad scope label using spaces
     * false: disabled
     * true: automatically
     * number: set exact maximum label length. Helpful when a scope can
     * be created after some log messages were sent
     */
    labelPadding: boolean | number;
  }

  interface ReportData {
    body: string;
    title: string;

    assignee: string;
    labels: string;
    milestone: string;
    projects: string;
    template: string;
  }

  interface CatchErrorsOptions {
    /**
     * Default true for the main process. Set it to false to prevent showing a
     * default electron error dialog
     */
    showDialog?: boolean;

    /**
     * Attach a custom error handler. If the handler returns false, this error
     * will not be processed
     */
    onError?(
      error: Error,
      versions?: { app: string; electron: string; os: string },
      submitIssue?: (url: string, data: ReportData | any) => void,
    ): void;
  }

  interface CatchErrorsResult {
    /**
     * Stop catching errors
     */
    stop (): void;
  }

  interface LogFunctions {
    /**
     * Log an error message
     */
    error (...params: any[]): void;

    /**
     * Log a warning message
     */
    warn (...params: any[]): void;

    /**
     * Log an informational message
     */
    info (...params: any[]): void;

    /**
     * Log a verbose message
     */
    verbose (...params: any[]): void;

    /**
     * Log a debug message
     */
    debug (...params: any[]): void;

    /**
     * Log a silly message
     */
    silly (...params: any[]): void;

    /**
     * Shortcut to info
     */
    log (...params: any[]): void;
  }

  interface ElectronLog extends LogFunctions {
    /**
     * Object contained only log functions
     */
    functions: LogFunctions;

    /**
     * Transport instances
     */
    transports: Transports;

    /**
     * Array with all attached hooks
     */
    hooks: Hook[];

    /**
     * Array with all available levels
     */
    levels: Levels;

    /**
     * Variables used by formatters
     */
    variables: Variables;

    /**
     * Catch and log unhandled errors/rejected promises
     */
    catchErrors (options?: CatchErrorsOptions): CatchErrorsResult;

    /**
     * Create a new electron-log instance
     */
    create(logId: string): ElectronLog.ElectronLog;

    /**
     * Create a new scope
     */
    scope: Scope;

    /**
     * Low level method which logs the message using specified transports
     */
    logMessageWithTransports(message: LogMessage, transports: Transport[]): void;
  }
}

// Merge namespace with interface
declare const ElectronLog: ElectronLog.ElectronLog & {
  default: ElectronLog.ElectronLog;
}
export = ElectronLog;
