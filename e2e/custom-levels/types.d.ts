declare module 'electron-log' {
  interface LogFunctions {
    notice(...params: any[]): void;
  }
}
