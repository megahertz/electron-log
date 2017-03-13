type LogLevel = "error" | "warn" | "info" | "verbose" | "debug" | "silly";
type LevelOption = LogLevel | false;

export interface ILogMessage {
    data: any[];
    date: Date;
    level: LogLevel;
}

interface IFormat {
    (msg: ILogMessage): void;
}

interface IConsoleTransport {
    (msg: ILogMessage): void;
    level: LevelOption;
    format: IFormat | string;
}

interface IFileTransport {
    (msg: ILogMessage): void;
    appName?: string;
    level: LevelOption;
    maxSize: number;
    streamConfig?: Object;
    format: IFormat | string;
    findLogPath(appName: string): string;
}

export declare function error(...params: any[]): void;
export declare function warn(...params: any[]): void;
export declare function info(...params: any[]): void;
export declare function verbose(...params: any[]): void;
export declare function debug(...params: any[]): void;
export declare function silly(...params: any[]): void;

export declare const transports: {
    console: IConsoleTransport;
    file: IFileTransport;
};
