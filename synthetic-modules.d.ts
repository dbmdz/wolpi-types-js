declare module "wolpi:fs" {
  /** Read-only directory entry shape returned by `readDirSync()`. */
  export interface DirEnt {
    name: string;
    parentPath?: string;
    isFile: boolean;
    isDirectory: boolean;
    isSymbolicLink: boolean;
    isOther: boolean;
  }

  /** Read-only stat shape returned by `statSync()` and `lstatSync()`. */
  export interface Stats {
    isFile(): boolean;
    isDirectory(): boolean;
    isSymbolicLink(): boolean;
    isOther(): boolean;
    size: number;
    atimeMs: number;
    mtimeMs: number;
    ctimeMs: number;
  }

  /** Read the entire contents of a file. */
  export function readFileSync(path: string): Uint8Array;

  /** Read the entries of a directory. */
  export function readDirSync(path: string): DirEnt[];

  /** Return file stats, following symbolic links. */
  export function statSync(path: string): Stats;

  /** Return file stats without following symbolic links. */
  export function lstatSync(path: string): Stats;

  /**
   * Test read/write/execute access for a path.
   *
   * `mode` is a string containing any of `r`, `w`, or `x`.
   */
  export function accessSync(path: string, mode?: string): void;
}

declare module "wolpi:fetch" {
  /** Options for the built-in synchronous fetch helper. */
  export interface FetchOptions {
    body?: string | Uint8Array;
    method?: string;
    headers?: Record<string, string>;
  }

  /** Response shape returned from the built-in synchronous fetch helper. */
  export interface FetchResponse {
    ok: boolean;
    status: number;
    headers: Record<string, string>;

    /** Return the response body as a `Uint8Array`. */
    array(): Uint8Array;

    /** Return the response body as an `ArrayBuffer`. */
    arrayBuffer(): ArrayBuffer;

    /** Decode the response body as UTF-8 text. */
    text(): string;

    /** Parse the response body as JSON. */
    json<T = unknown>(): T;
  }

  /** Bare-bones synchronous `fetch` implementation backed by Java's `HttpClient`. */
  export default function fetchSync(url: string, options?: FetchOptions): FetchResponse;
}
