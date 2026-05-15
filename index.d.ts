/// <reference path="./synthetic-modules.d.ts" />

/** Marker interface for Java host objects exposed to GraalJS.
*
* Refer to the JavaDoc for the corresponding types for information
* on the available APIs.
*/
export interface JavaHostObject {}

/** Wolpi extension API versions currently supported by the runtime. */
export type ApiVersion = 1;

/** Scalar JSON value accepted by Wolpi APIs. */
export type JsonPrimitive = string | number | boolean | null;

/** JSON array containing JSON values. */
export interface JsonArray extends Array<JsonValue> {}

/** JSON object mapping string keys to JSON values. */
export interface JsonObject {
  [key: string]: JsonValue;
}

/** Recursive JSON value used for `info.json` augmentation and error details. */
export type JsonValue = JsonPrimitive | JsonObject | JsonArray;

/** Immutable JSON array containing immutable JSON values. */
export interface ImmutableJsonArray extends ReadonlyArray<ImmutableJsonValue> {}

/** Immutable JSON input object. */
export interface ImmutableJsonObject {
  readonly [key: string]: ImmutableJsonValue;
}

/** Immutable JSON input value. */
export type ImmutableJsonValue =
  | JsonPrimitive
  | ImmutableJsonObject
  | ImmutableJsonArray;

/** HTTP headers. */
export type HttpHeaders = Record<string, string[]>;

/** Supported IIIF quality values. */
export type IIIFQuality = "color" | "gray" | "bitonal";

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

/** IIIF version accepted by parser helpers, either as a host enum or a short string. */
export type IIIFVersionInput = IIIFVersion | "v2" | "v3";

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
 * or object storage systems. Metadata may be attached as additional properties.
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

/** Marker result indicating that the source has not changed since the client's cached copy. */
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
  extraHeaders?: HttpHeaders;
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
  parseSize(version: IIIFVersionInput, spec: string, sourceSize: ImageSize): ImageSize;

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
  parseQuality(spec: string): IIIFQuality;

  /** Convert a request into its canonical form, or return `null` if unavailable. */
  toCanonicalForm(request: ImageApiRequest, sourceSize: ImageSize): ImageApiRequest | null;
}

/**
 * Global runtime context available to JavaScript extensions as `wolpi`.
 */
export interface ExtensionGuestContext {
  /** Extension configuration object, if one was provided. */
  config: Record<string, unknown> | null;

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

/** Names for hooks related to image processing, used to mark them as skippable. */
export type ImageHookName =
  | 'preProcessImage'
  | 'preCrop'
  | 'preScale'
  | 'preRotate'
  | 'preQuality'
  | 'preFormat';

/**
 * A Wolpi extension.
 *
 * `info` and `cleanup` are required. The remaining hooks are optional, so
 * extensions can implement only the hooks they need.
 */
export interface WolpiExtension {
  /**
   * Return static metadata describing the extension.
   *
   * Wolpi calls this during extension discovery and startup in a separate
   * runtime context. Do not use it for initialization or request-scoped state.
   *
   * @returns Static extension metadata.
   */
  info: () => ExtensionInfo;

  /**
   * Reset any request-scoped state accumulated during request handling.
   *
   * This hook is required even for extensions that keep no per-request state
   * to force explicit consideration of cleanup needs.
   */
  cleanup: () => void;

  /**
   * Run expensive initialization, once, outside the request-response cycle.
   *
   * Use this for long-lived resources that should not be created during a
   * request, like database connections.
   */
  setup?: () => void;

  /**
   * Clean up resources previously allocated in `setup()`.
   *
   * This hook runs when the extension instance is shut down, not after each
   * request.
   */
  destroy?: () => void;

  /**
   * Return image-processing hooks that can be skipped for `request`.
   *
   * Returned hooks are not run for that request. This helps ensure that we hit
   * Wolpi's fast paths for image processing when an extension clearly states
   * that it doesn't need to touch the image processing pipeline for a given
   * request.
   *
   * @param request The current IIIF request as an {@link ImageApiRequest} object.
   * @returns Hook names that Wolpi may skip for this request, or `null` /
   * `undefined` if no hooks can be skipped.
   */
  skippableHooks?: (request: ImageApiRequest) => Iterable<ImageHookName> | null | undefined | void;

  /**
   * Authorize access to `identifier` for the given request context.
   *
   * `headers` contains all request header values and `clientIp` is the original
   * client IP after proxy resolution. If multiple extensions implement this
   * hook, all of them must allow the request.
   *
   * @param identifier The image identifier being requested.
   * @param headers Request headers as {@link HttpHeaders}.
   * @param clientIp Original client IP after proxy resolution.
   * @returns `true` to allow access, `false` to deny it.
   */
  authorize?: (identifier: string, headers: HttpHeaders, clientIp: string) => boolean;

  /**
   * Resolve `identifier` to a supported {@link ResolvedImage} or return `null`.
   *
   * The cache validator arguments mirror the client's conditional request
   * headers when present. Resolver return objects may include nested `imageInfo`
   * and `cacheInfo` objects to avoid extra probing for `info.json`; {@link
   * SourceNotModified} forces a 304 response.
   *
   * If this hook returns a {@link HttpResolvedImage} or a
   * {@link FilesystemResolvedImage}, Wolpi will handle the check if a 304 Not
   * Modified response can be sent based on the provided metadata and the
   * client's validators, so extensions only need to return
   * {@link SourceNotModified} if they have custom logic for determining
   * staleness.
   *
   * @param identifier The image identifier to resolve.
   * @param clientETag Client `ETag` validator, if present.
   * @param clientLastModified Client `Last-Modified` validator, if present.
   * @returns A supported {@link ResolvedImage} shape or `null` / `undefined`.
   */
  resolve?: (
    identifier: string,
    clientETag?: string | null,
    clientLastModified?: string | null,
  ) => ResolvedImage | null | undefined | void;

  /**
   * Return a new `info.json` object or `null` to keep the current one.
   *
   * `currentInfoJson` is read-only; return a modified copy if you want to change
   * it. If multiple extensions implement this hook, each receives the previous
   * extension's result in configuration order.
   *
   * @param identifier The image identifier.
   * @param currentInfoJson The current `info.json` object as an immutable mapping.
   * @param iiifVersion Numeric IIIF Image API version.
   * @returns A new {@link JsonObject} or `null` / `undefined` to keep the
   * current value.
   */
  augmentInfoJson?: (
    identifier: string,
    currentInfoJson: ImmutableJsonObject,
    iiifVersion: number,
  ) => JsonObject | null | undefined | void;

  /**
   * Run before the standard processing pipeline.
   *
   * Perform mutations on the `image` before any of Wolpi's standard processing
   * steps run. This is the place to apply global image transformations that
   * don't map cleanly to the crop/scale/rotate/quality steps, like
   * watermarking.
   *
   * The returned image must keep the same dimensions as the input image or
   * Wolpi ignores it. If multiple extensions implement this hook, each receives
   * the previous extension's result, if it was not `null` or `undefined`.
   *
   * `imageInfo` describes the original input image. `image` is either the
   * original image (if the extension is the first to be called), or the result
   * of the previous extension's `preProcessImage` result, if it was not `null`
   * or `undefined`.
   *
   * @param image Current pipeline image as a {@link VImage} host object.
   * @param identifier The image identifier.
   * @param imageInfo Source image metadata as {@link ImageInfo}.
   * @param request Current IIIF request as {@link ImageApiRequest}.
   * @returns A replacement {@link VImage} or `null` / `undefined` to keep the
   * existing pipeline image.
   */
  preProcessImage?: (
    image: VImage,
    identifier: string,
    imageInfo: ImageInfo,
    request: ImageApiRequest,
  ) => VImage | null | undefined | void;

  /**
   * Override or augment the image scaling step.
   *
   * `imageInfo` describes the original input image. If multiple extensions
   * implement this hook, the first non-`null`/non-`undefined` result wins;
   * returning `null` or `undefined` falls back to the next extension or Wolpi's
   * default scaling.
   *
   * If you need to run Wolpi's standard scaling logic and then apply additional
   * transformations, use the {@link ImageRequestParser} (available in
   * `wolpi.imageRequestParser`) to parse `request.sizeSpec` into a target
   * {@link ImageSize}.
   *
   * @param image Current pipeline image as a {@link VImage} host object.
   * @param identifier The image identifier.
   * @param imageInfo Source image metadata as {@link ImageInfo}.
   * @param request Current IIIF request as {@link ImageApiRequest}.
   * @returns A scaled {@link VImage} or `null` / `undefined` to keep Wolpi's
   * default scaling behavior.
   */
  preScale?: (
    image: VImage,
    identifier: string,
    imageInfo: ImageInfo,
    request: ImageApiRequest,
  ) => VImage | null | undefined | void;

  /**
   * Override or augment the image crop step.
   *
   * `imageInfo` describes the original input image. If multiple extensions
   * implement this hook, the first non-`null`/non-`undefined` result wins;
   * returning `null` or `undefined` falls back to the next extension or Wolpi's
   * default cropping.
   *
   * If you need to run Wolpi's standard cropping logic and then apply
   * additional transformations, use the {@link ImageRequestParser} (available in
   * `wolpi.imageRequestParser`) to parse `request.cropSpec` into a target
   * {@link CropRectangle}.
   *
   * @param image Current pipeline image as a {@link VImage} host object.
   * @param identifier The image identifier.
   * @param imageInfo Source image metadata as {@link ImageInfo}.
   * @param request Current IIIF request as {@link ImageApiRequest}.
   * @returns A cropped {@link VImage} or `null` / `undefined` to keep Wolpi's
   * default cropping behavior.
   */
  preCrop?: (
    image: VImage,
    identifier: string,
    imageInfo: ImageInfo,
    request: ImageApiRequest,
  ) => VImage | null | undefined | void;

  /**
   * Override or augment the image rotation step.
   *
   * `imageInfo` describes the original input image. If multiple extensions
   * implement this hook, the first non-`null`/non-`undefined` result wins;
   * returning `null` or `undefined` falls back to the next extension or Wolpi's
   * default rotation.
   *
   * If you need to run Wolpi's standard rotation logic and then apply
   * additional transformations, use the {@link ImageRequestParser} (available in
   * `wolpi.imageRequestParser`) to parse `request.rotationSpec` into a target
   * {@link Rotation}.
   *
   * @param image Current pipeline image as a {@link VImage} host object.
   * @param identifier The image identifier.
   * @param imageInfo Source image metadata as {@link ImageInfo}.
   * @param request Current IIIF request as {@link ImageApiRequest}.
   * @returns A replacement {@link VImage} or `null` / `undefined` to keep
   * Wolpi's default rotation behavior.
   */
  preRotate?: (
    image: VImage,
    identifier: string,
    imageInfo: ImageInfo,
    request: ImageApiRequest,
  ) => VImage | null | undefined | void;

  /**
   * Override or augment the image quality step.
   *
   * `imageInfo` describes the original input image. If multiple extensions
   * implement this hook, the first non-`null`/non-`undefined` result wins;
   * returning `null` or `undefined` falls back to the next extension or Wolpi's
   * default quality handling.
   *
   * If you need to run Wolpi's standard quality logic and then apply additional
   * transformations, use the {@link ImageRequestParser} (available in
   * `wolpi.imageRequestParser`) to parse `request.qualitySpec` into a target
   * {@link IIIFQuality}.
   *
   * @param image Current pipeline image as a {@link VImage} host object.
   * @param identifier The image identifier.
   * @param imageInfo Source image metadata as {@link ImageInfo}.
   * @param request Current IIIF request as {@link ImageApiRequest}.
   * @returns A replacement {@link VImage} or `null` / `undefined` to keep
   * Wolpi's default quality handling.
   */
  preQuality?: (
    image: VImage,
    identifier: string,
    imageInfo: ImageInfo,
    request: ImageApiRequest,
  ) => VImage | null | undefined | void;

  /**
   * Encode the processed image before Wolpi applies its default encoder.
   *
   * Return an {@link EncodedImage} with encoded data, the response content type,
   * and optional {@link HttpHeaders}. If multiple extensions implement this
   * hook, the first non-`null`/non-`undefined` result wins; returning `null` or
   * `undefined` keeps the default encoder.
   *
   * @param image Current pipeline image as a {@link VImage} host object.
   * @param identifier The image identifier.
   * @param imageInfo Source image metadata as {@link ImageInfo}.
   * @param request Current IIIF request as {@link ImageApiRequest}.
   * @returns An {@link EncodedImage} or `null` / `undefined` to keep Wolpi's
   * default encoding logic.
   */
  preFormat?: (
    image: VImage,
    identifier: string,
    imageInfo: ImageInfo,
    request: ImageApiRequest,
  ) => EncodedImage | null | undefined | void;
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
