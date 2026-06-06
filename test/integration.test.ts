/** Integration tests against live Pepkio Tools API. */

import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { config as loadEnv } from "dotenv";
import { describe, expect, it } from "vitest";

import { PepkioClient } from "../src/client.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load monorepo .env for local integration runs (never log keys).
const monorepoEnv = resolve(__dirname, "../../../.env");
if (existsSync(monorepoEnv)) {
  loadEnv({ path: monorepoEnv });
}

const packageEnv = resolve(__dirname, "../.env");
if (existsSync(packageEnv)) {
  loadEnv({ path: packageEnv });
}

const ALL_ENVIRONMENTS = [
  { name: "local", baseUrl: "https://tools.localtest.me" },
  { name: "production", baseUrl: "https://tools.pepkio.com" },
] as const;

function environmentsToTest(): (typeof ALL_ENVIRONMENTS)[number][] {
  const override = process.env.PEPKIO_API_BASE_URL?.replace(/\/$/, "");
  if (override) {
    const match = ALL_ENVIRONMENTS.find((env) => env.baseUrl === override);
    if (match) {
      return [match];
    }
    return [{ name: "override" as const, baseUrl: override }];
  }
  return [...ALL_ENVIRONMENTS];
}

function apiKeyFor(baseUrl: string): string | undefined {
  if (baseUrl.includes("localtest.me")) {
    return process.env.LOCAL_PEPKIO_API_KEY ?? process.env.PEPKIO_API_KEY;
  }
  return process.env.PEPKIO_API_KEY;
}

function clientFor(env: { baseUrl: string }): PepkioClient | null {
  const apiKey = apiKeyFor(env.baseUrl);
  if (!apiKey) {
    return null;
  }
  return new PepkioClient({ apiKey, baseUrl: env.baseUrl });
}

describe.each(environmentsToTest())("$name integration", (env) => {
  const client = clientFor(env);
  const maybeIt = client ? it : it.skip;

  maybeIt("fetches manifest", async () => {
    const manifest = await client!.getManifest({ refresh: true });
    expect(manifest.tool_id).toBe("pcr-master-mix-calculator");
    const names = await client!.listExamples();
    expect(names).toContain("qpcr_20ul_sybr");
    expect(names).toContain("genotyping_25ul_gotaq");
    expect(names).toContain("multi_assay_three_primers");
  });

  maybeIt("runs qpcr_20ul_sybr example", async () => {
    const input = await client!.getExampleInput("qpcr_20ul_sybr");
    const result = await client!.run(input);
    expect(result.status).toBe("completed");
    expect(result.run_id).toBeTruthy();
    expect(result.permalink).toBeTruthy();
    expect(result.result).toBeTruthy();
    expect(result.result?.has_blocking_errors).toBe(false);
    expect(Array.isArray(result.result?.assays)).toBe(true);
    const assays = result.result?.assays as unknown[];
    expect(assays.length).toBeGreaterThan(0);
    for (const assay of assays) {
      const a = assay as Record<string, unknown>;
      expect(Array.isArray(a.reagents)).toBe(true);
      for (const row of a.reagents as unknown[]) {
        const r = row as Record<string, unknown>;
        if (r.per_reaction_ul != null) {
          expect(typeof r.per_reaction_ul).toBe("number");
        }
      }
    }
    expect(result.error).toBeNull();
  });

  maybeIt("runs multi_assay_three_primers example", async () => {
    const input = await client!.getExampleInput("multi_assay_three_primers");
    const result = await client!.run(input);
    expect(result.status).toBe("completed");
    expect(result.result).toBeTruthy();
    const assays = result.result?.assays as unknown[];
    expect(assays.length).toBe(3);
    expect(Array.isArray(result.result?.consolidated)).toBe(true);
  });

  maybeIt("runs invalid_final_gt_stock example with blocking errors", async () => {
    const input = await client!.getExampleInput("invalid_final_gt_stock");
    const result = await client!.run(input);
    expect(result.status).toBe("completed");
    expect(result.result?.has_blocking_errors).toBe(true);
  });

  maybeIt("runs pipette_warning_sub_half_ul example with warnings", async () => {
    const input = await client!.getExampleInput("pipette_warning_sub_half_ul");
    const result = await client!.run(input);
    expect(result.status).toBe("completed");
    expect(result.result?.has_blocking_errors).toBe(false);
    const assays = result.result?.assays as Record<string, unknown>[];
    const reagents = (assays[0]?.reagents ?? []) as Record<string, unknown>[];
    const warningRow = reagents.find((r) => r.status === "warning");
    expect(warningRow).toBeTruthy();
    expect(String(warningRow?.dilution_suggestion)).toContain("-fold");
  });
});
