import fs from "node:fs";
import {pathToFileURL} from "node:url";

import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const schema = JSON.parse(
  fs.readFileSync(new URL("../catalogue/php-ci.schema.json", import.meta.url), "utf8"),
);
const ajv = new Ajv2020({allErrors: true, strict: true});
addFormats(ajv);
const validate = ajv.compile(schema);

export function validateCatalogue(catalogue) {
  const valid = validate(catalogue);
  const errors = valid ? [] : (validate.errors ?? []).map((error) => `${error.instancePath || "/"} ${error.message}`);
  const logicalIds = new Set();
  for (const [index, entry] of (catalogue.entries ?? []).entries()) {
    if (logicalIds.has(entry.logicalId)) errors.push(`/entries/${index}/logicalId must be unique`);
    logicalIds.add(entry.logicalId);
  }
  return {errors};
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const input = JSON.parse(fs.readFileSync(process.argv[2] ?? "catalogue/php-ci.json", "utf8"));
    const result = validateCatalogue(input);
    if (result.errors.length > 0) {
      console.error(result.errors.join("\n"));
      process.exitCode = 1;
    } else {
      console.log(`Validated ${(input.entries ?? []).length} PHP CI runtime image entries.`);
    }
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
