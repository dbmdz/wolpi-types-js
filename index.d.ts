/// <reference path="./synthetic-modules.d.ts" />

/** Marker interface for Java host objects exposed to GraalJS.
*
* Refer to the JavaDoc for the corresponding types for information
* on the available APIs.
*/
export interface JavaHostObject {}

/** Wolpi extension API versions currently supported by the runtime. */
export type ApiVersion = 1;

/** Opaque host object for libvips images.
*
* Refer to the {@link
* https://vipsffm.photofox.app/app.photofox.vipsffm/app/photofox/vipsffm/VImage.html|JavaDoc}
* for information on the available APIs.
*/
export type VImage = JavaHostObject;

/**
 * Java {@link https://docs.oracle.com/en/java/javase/22/docs/api/java.base/java/lang/foreign/Arena.html|java.lang.foreign.Arena}
 * host object passed to vips-ffm APIs for creating new images.
 *
 * Treat this as an opaque handle that is only forwarded to vips-ffm. Do not
 * store a reference to it or try to manipulate it directly.
 */
export interface Arena extends JavaHostObject {}

/** Java {@link https://docs.oracle.com/javase/8/docs/api/java/nio/ByteBuffer.html|java.nio.ByteBuffer} type. */
export interface ByteBuffer extends JavaHostObject {}

/** Java {@link https://docs.oracle.com/en/java/javase/11/docs/api/java.net.http/java/net/http/HttpClient.html|java.net.http.HttpClient} type. */
export interface HttpClient extends JavaHostObject {}

/**
 * IIIF Image API version exposed guest-side as a Java host enum object.
 */
export interface IIIFVersion extends JavaHostObject {
  /** Returns the Java enum constant name, e.g. `V2` or `V3`. */
  name(): string;

  /** Returns the numeric IIIF Image API version, e.g. `2` or `3`. */
  value(): number;
}

/** Width and height in pixels. */
export interface ImageSize {
  width: number;
  height: number;
}

/**
 * Tile size information directly encoded in the image, for example in JPEG2000
 * or TIFF pyramids.
 */
export interface TileSize {
  width: number;
  height?: number | null;
  scaleFactors: number[];
}

/**
 * Metadata about an image that can be supplied by a resolver to avoid having
 * Wolpi load the image just to extract information for `info.json` requests.
 */
export interface ImageInfo {
  /** Source image format, if known. */
  format?: string | null;

  /** Native image size before any processing. */
  nativeSize: ImageSize;

  /** Sizes directly encoded in the image, for example JPEG2000 or TIFF layers. */
  sizes: ImageSize[];

  /** Tile sizes directly encoded in the image, for example JPEG2000 or TIFF tiles. */
  tileSizes: TileSize[];
}

/** Optional HTTP cache metadata associated with a resolved image. */
export interface CacheInfo {
  eTag?: string;
  /** Last-modified timestamp as a JS `Date` or an ISO-8601 string. */
  lastModified?: Date | string;
}

/** Rectangular crop region in non-fractional pixels. */
export interface CropRectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Parsed rotation information. */
export interface Rotation {
  /** Degrees of clockwise rotation. */
  degrees: number;

  /** Whether the image should be mirrored on the vertical axis before rotating. */
  mirror: boolean;
}

/**
 * IIIF Image API request object passed to image-processing hooks.
 *
 * Note that `version` is exposed to JavaScript as a Java host enum object.
 */
export interface ImageApiRequest {
  identifier: string;
  version: IIIFVersion;
  cropSpec: string;
  sizeSpec: string;
  rotationSpec: string;
  qualitySpec: string;
  formatSpec: string;
}

/** Information returned by the `info()` hook. */
export interface ExtensionInfo {
  /** Wolpi Extension API version the extension is programmed against. */
  apiVersion: ApiVersion;

  /** Human-readable extension name. */
  name: string;

  /** Short extension description. */
  description: string;
}

/** Shared metadata fields accepted by resolver return objects. */
interface ResolvedMeta {
  imageInfo?: ImageInfo;
  cacheInfo?: CacheInfo;
}

/** An image file in a file system accessible to Wolpi. */
export interface FilesystemResolvedImage extends ResolvedMeta {
  path: string;
}

/** A raw encoded image blob that will be decoded by libvips. */
export interface BinaryResolvedImage extends ResolvedMeta {
  rawData: Uint8Array | ArrayBufferView;
}

/**
 * An image accessible via HTTP(S), optionally with custom request headers
 * such as authorization headers.
 */
export interface HttpResolvedImage extends ResolvedMeta {
  url: string;
  headers?: Record<string, string>;
}

/**
 * A custom data source that libvips will read from using callbacks.
 *
 * This can be more efficient for large images from backends such as databases
 * or object storage systems.
 */
export interface CustomSourceResolvedImage extends ResolvedMeta {
  /**
   * Seek to a new position.
   *
   * `whence` is:
   * - `0`: beginning of file
   * - `1`: current position
   * - `2`: end of file
   */
  onSeek(offset: number, whence: number): number;

  /**
   * Read up to `length` bytes from the current position.
   *
   * The returned buffer is copied, so it is safe to reuse internal buffers for
   * subsequent calls.
   */
  onRead(length: number): Uint8Array | ArrayBufferView;
}

/** Error type that signals that the source has not been modified since the client's cached copy. */
export interface SourceNotModified {
  notModified: true;
  imageInfo?: ImageInfo;
  cacheInfo?: CacheInfo;
}

/** Value returned from the `resolve()` hook. */
export type ResolvedImage =
  | FilesystemResolvedImage
  | BinaryResolvedImage
  | HttpResolvedImage
  | CustomSourceResolvedImage
  | SourceNotModified;

/**
 * Java wrapper around a resolved image plus identifier and optional metadata.
 *
 * This type is used internally by Wolpi after the `resolve()` hook result has
 * been mapped into Java.
 */
export interface ImageSource {
  identifier: string;
  resolvedImage: ResolvedImage;
  imageInfo?: ImageInfo | null;
  cacheInfo?: CacheInfo | null;
}

/**
 * Encoded image data returned by the `preFormat()` hook.
 *
 * `data` may be a Java `ByteBuffer` or a JS byte container.
 */
export interface EncodedImage {
  data: Uint8Array | ArrayBufferView | ByteBuffer;
  contentType: string;
  extraHeaders?: Record<string, string[]>;
}

/** Counter metric that should only increase. */
export interface CounterMetric {
  /** Increment the counter by `1` or by the given positive amount. */
  increment(value?: number): void;
}

/** Gauge metric for values that can go up and down. */
export interface GaugeMetric {
  /** Set the gauge to the given value. */
  set(value: number): void;
}

/** Running timer handle returned from `TimerMetric.start()`. */
export interface RunningTimer {
  /** Stop the timer and record the duration. */
  stop(): void;
}

/** Timer metric for measuring durations. */
export interface TimerMetric {
  /** Run a callback and record how long it took to complete. */
  record<T>(fn: () => T): T;

  /** Start a timer that can be stopped later. */
  start(): RunningTimer;
}

/**
 * Entry point for creating custom metrics in extensions.
 *
 * Metrics are registered in Wolpi's meter registry. Duplicate registrations
 * with the same name and labels are deduplicated by the underlying metrics
 * library.
 */
export interface ExtensionMetrics {
  /** Create or retrieve a counter metric. */
  counter(
    name: string,
    unit?: string | null,
    description?: string | null,
    labels?: Record<string, string> | null,
  ): CounterMetric;

  /** Create or retrieve a gauge metric. */
  gauge(
    name: string,
    unit?: string | null,
    description?: string | null,
    labels?: Record<string, string> | null,
  ): GaugeMetric;

  /** Create or retrieve a timer metric. */
  timer(
    name: string,
    description?: string | null,
    labels?: Record<string, string> | null,
  ): TimerMetric;
}

/**
 * Logger exposed to extensions.
 *
 * Loggers are prefixed with `wolpi.extension.<extension-name>` and support
 * additional structured key-value details.
 */
export interface ExtensionLogger {
  /** Create a child logger with the given name appended to the current logger name.
   *
   * Note that the logger itself is already bound to the extension name, so this should only
   * be used to create more specific sub-loggers.
  */
  getLogger(name: string): ExtensionLogger;

  /** Log a message at DEBUG level.
   *
   * @param message The log message.
   * @param keyVals Optional additional structured details to include with the log message.
   */
  debug(message: string, keyVals?: Record<string, unknown> | null): void;

  /** Log a message at INFO level.
   *
   * @param message The log message.
   * @param keyVals Optional additional structured details to include with the log message.
   */
  info(message: string, keyVals?: Record<string, unknown> | null): void;

  /** Log a message at WARN level.
   *
   * @param message The log message.
   * @param keyVals Optional additional structured details to include with the log message.
   */
  warn(message: string, keyVals?: Record<string, unknown> | null): void;

  /** Log a message at ERROR level.
   *
   * @param message The log message.
   * @param keyVals Optional additional structured details to include with the log message.
   */
  error(message: string, keyVals?: Record<string, unknown> | null): void;
}

/**
 * Parser for IIIF Image API requests.
 *
 * Use this when implementing custom behavior that still wants to rely on
 * Wolpi's parsing and validation of official IIIF request syntax.
 */
export interface ImageRequestParser {
  /**
   * Parse a region specification.
   *
   * Supports `full`, `square`, `x,y,w,h`, and `pct:x,y,w,h`.
   */
  parseRegion(spec: string, sourceSize: ImageSize): CropRectangle;

  /**
   * Parse a size specification for IIIF v2 or v3.
   *
   * Supports official IIIF size syntax such as `full`, `max`, `^max`,
   * `w,`, `,h`, `pct:n`, `w,h`, and `!w,h` variants where applicable.
   */
  parseSize(version: IIIFVersion | "v2" | "v3", spec: string, sourceSize: ImageSize): ImageSize;

  /**
   * Parse a rotation specification.
   *
   * Supported forms are `n` and `!n`, where `n` is a clockwise angle in
   * degrees between `0` and `360`.
   */
  parseRotation(spec: string): Rotation;

  /**
   * Parse and validate a quality specification.
   *
   * Supported values are `color`, `gray`, and `bitonal`.
   */
  parseQuality(spec: string): "color" | "gray" | "bitonal";

  /** Convert a request into its canonical form, or return `null` if unavailable. */
  toCanonicalForm(request: ImageApiRequest, sourceSize: ImageSize): ImageApiRequest | null;
}

/**
 * Global runtime context available to JavaScript extensions as `wolpi`.
 */
export interface ExtensionGuestContext {
  /** Extension configuration object, if one was provided. */
  config: Record<string, any> | null;

  /** Wolpi version currently running. */
  wolpiVersion: string;

  /** Version of the currently running extension. */
  extensionVersion: string;

  /** Logger instance for extension log output. */
  logger: ExtensionLogger;

  /** Metrics entry point for custom counters, gauges, and timers. */
  metrics: ExtensionMetrics;

  /** Opaque arena handle for vips-related host APIs. */
  vipsArena: Arena;

  /** Helper for parsing official IIIF request syntax. */
  imageRequestParser: ImageRequestParser;

  /** Shared Java HTTP client instance. */
  httpClient: HttpClient;

  /**
   * Configured base URI for this Wolpi instance, if available.
   *
   * If no explicit base URI is configured, Wolpi may derive one from the
   * current request context. The value can still be `null` when no request
   * context is active.
   */
  baseUri: string | null;
}

/**
 * Shape recognized by Wolpi when guest code throws an object to request an
 * HTTP error response.
 */
export interface HttpStatusError {
  message: string;
  status: number;
  details?: Record<string, unknown>;
}

/** Hook returning static extension metadata. */
export type InfoHook = () => ExtensionInfo;

/** Hook called when the extension is initialized. */
export type SetupHook = () => void;

/** Hook called when the extension is destroyed. */
export type DestroyHook = () => void;

/** Hook called after a request to clean up request-scoped extension state. */
export type CleanupHook = () => void;

/** Names for hooks related to image processing, used to mark them as skippable. */
export type ImageHookName =
  | 'preProcessImage'
  | 'preCrop'
  | 'preScale'
  | 'preRotate'
  | 'preQuality'
  | 'preFormat';

/** Mark a set of hooks as skippable for this request, allowing Wolpi to skip calling them and
 *  choose a faster execution path, if possible.
 *
 * By default, all hooks that an extension implements are non-skippable, meaning
 * that Wolpi must call them for every request and assume that they may mutate
 * the image or otherwise affect processing. If a hook is marked as skippable,
 * Wolpi can skip calling it and take a faster path if it determines that the
 * hook's functionality is not needed for the current request.
 */
export type SkippableHooksHook = (request: ImageApiRequest) => ImageHookName[] | Set<ImageHookName>;

/**
 * Authorization hook.
 *
 * Return `true` to allow access and `false` to deny it.
 */
export type AuthorizeHook = (identifier: string, headers: Record<string, string[]>, clientIp: string) => boolean;

/**
 * Resolve an image identifier to an image source.
 *
 * The hook receives caching headers from the client, if present, and may also
 * return `imageInfo` / `cacheInfo` metadata to avoid extra probing by Wolpi.
 */
export type ResolveHook = (
  identifier: string,
  clientETag?: string | null,
  clientLastModified?: string | null,
) => ResolvedImage | null | undefined | void;

/**
 * Augment the generated `info.json` response.
 *
 * Return a new object rather than mutating the input object in place.
 */
export type AugmentInfoJsonHook = (
  identifier: string,
  currentInfoJson: Record<string, unknown>,
  iiifVersion: number,
) => Record<string, unknown> | null | undefined | void;

/**
 * Hook signature shared by image-processing hooks such as `preProcessImage`,
 * `preScale`, `preCrop`, `preRotate`, and `preQuality`.
 */
export type ImageProcessingHook = (
  image: VImage,
  identifier: string,
  imageInfo: ImageInfo,
  request: ImageApiRequest,
) => VImage | null | undefined | void;

/**
 * Hook called before the image is encoded to the requested output format.
 *
 * Return an `EncodedImage` to take over encoding or `null` / `undefined` to
 * let Wolpi continue with its default encoding.
 */
export type PreFormatHook = (
  image: VImage,
  identifier: string,
  imageInfo: ImageInfo,
  request: ImageApiRequest,
) => EncodedImage | null | undefined | void;

/** A Wolpi extension. */
export interface WolpiExtension {
  info: InfoHook;
  cleanup: CleanupHook;
  setup?: SetupHook;
  destroy?: DestroyHook;
  skippableHooks?: SkippableHooksHook;
  authorize?: AuthorizeHook;
  resolve?: ResolveHook;
  augmentInfoJson?: AugmentInfoJsonHook;
  /**
   * Run before the standard processing pipeline.
   *
   * The returned image must keep the same dimensions as the input image.
   * Wolpi ignores results with different width or height.
   */
  preProcessImage?: ImageProcessingHook;
  preCrop?: ImageProcessingHook;
  preScale?: ImageProcessingHook;
  preRotate?: ImageProcessingHook;
  preQuality?: ImageProcessingHook;
  preFormat?: PreFormatHook;
}

/** Minimal GraalJS `Java` interop surface used by Wolpi extensions. */
export interface GraalJavaInterop {
  /** Resolve a Java class by fully qualified class name. */
  type<T = any>(className: string): T;
}

declare global {
  /** Global Wolpi runtime context available to all JavaScript extensions. */
  const wolpi: ExtensionGuestContext;

  /** GraalJS Java interop global. */
  const Java: GraalJavaInterop;
}
