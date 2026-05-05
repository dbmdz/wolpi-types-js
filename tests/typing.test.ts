import type {
  ExtensionInfo,
  ImageHookName,
  ImmutableJsonValue,
  JsonValue,
  WolpiExtension,
} from "@mdz/wolpi-types";

const info: WolpiExtension["info"] = (): ExtensionInfo => ({
  apiVersion: 1,
  name: "type-test-extension",
  description: "Compile-time typing checks for the public API",
});

const cleanup: WolpiExtension["cleanup"] = () => {};

const objectExtension: WolpiExtension = {
  info,
  cleanup,
};

class ClassExtension implements WolpiExtension {
  info(): ExtensionInfo {
    return info();
  }

  cleanup(): void {}
}

const classExtension: WolpiExtension = new ClassExtension();

const jsonValue: JsonValue = {
  nested: ["value", 1, true, null, { ok: ["still", "json"] }],
};

const immutableJsonValue: ImmutableJsonValue = {
  nested: ["value", 1, true, null, { ok: ["still", "json"] }],
};

const skippableHooks: NonNullable<WolpiExtension["skippableHooks"]> = (): Iterable<ImageHookName> => [
  "preScale",
  "preFormat",
];

// @ts-expect-error `cleanup` is required on all extensions.
const missingCleanup: WolpiExtension = {
  info,
};

// @ts-expect-error `undefined` is not a valid JSON value.
const invalidJsonValue: JsonValue = {
  broken: undefined,
};

// @ts-expect-error Only known image hook names may be marked skippable.
const invalidSkippableHooks: NonNullable<WolpiExtension["skippableHooks"]> = () => ["notARealHook"];

void objectExtension;
void classExtension;
void jsonValue;
void immutableJsonValue;
void skippableHooks;
void missingCleanup;
void invalidJsonValue;
void invalidSkippableHooks;
