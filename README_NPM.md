# Pepkio PCR Master Mix Calculator

ESM TypeScript client for scaling PCR and qPCR master-mix reagent volumes through the Pepkio Tools REST API from Node.js scripts, bundlers, and CI pipelines.

# What It Does

Setting up PCR or qPCR often means scaling buffer, primers, dNTPs, enzyme, and water to a target reaction volume, adding overage for pipetting loss, and repeating the arithmetic for each assay on a plate or run. This package calls the hosted Pepkio PCR Master Mix Calculator over REST so you can generate volume plans programmatically—without reimplementing calculator logic locally.

Use it from Node.js (≥18), bundlers, or CI to fetch the tool manifest, run named examples, or submit custom input JSON. Each completed run returns per-reaction microliter volumes, consolidated batch totals across assays, dilution warnings for sub-microliter transfers, and an optional permalink to the same plan in the web UI. Programmatic runs require a network connection and a Pepkio API key.

# Features

- Multiple assays per session with independent reaction volume, count, and overage factor
- Reagent units: molar (`M`, `mM`, `uM`, `nM`) and fold (for buffers and enzyme)
- Per-reaction and batch volumes scaled by `reaction_count × overage_factor`
- Water volume computed as the remainder to fill each reaction
- Consolidated reagent totals when planning several assays together
- Warnings for transfer volumes below 0.5 µL with dilution suggestions
- Manifest helpers: `getManifest`, `listExamples`, `getExampleInput`
- `run`, `getRun`, and `waitForRun` for sync execution
- CLI: `pepkio-pcr-master-mix-calculator manifest` and `run`
- Configurable via `PEPKIO_API_KEY` and `PEPKIO_API_BASE_URL`

# Installation

```bash
npm install pepkio-pcr-master-mix-calculator
```

Requires Node.js 18 or newer.

# Configuration

Set an API key with **tools:run** scope before calling `run()`:

```bash
export PEPKIO_API_KEY="your-key"
```

Create a key at [Pepkio API keys](https://www.pepkio.com/account/api-keys).

Optional overrides:

| Variable | Purpose |
|----------|---------|
| `PEPKIO_API_KEY` | Production API key (required for `run`) |
| `LOCAL_PEPKIO_API_KEY` | Local dev key when `PEPKIO_API_BASE_URL` points to `tools.localtest.me` |
| `PEPKIO_API_BASE_URL` | API host (default `https://tools.pepkio.com`) |

# Quick Example

```typescript
import { PepkioClient } from "pepkio-pcr-master-mix-calculator";

const client = new PepkioClient({ apiKey: process.env.PEPKIO_API_KEY });

const input = await client.getExampleInput("qpcr_20ul_sybr");
const result = await client.run(input);

for (const assay of (result.result?.assays ?? []) as Record<string, unknown>[]) {
  console.log(assay.name, assay.total_reactions);
  for (const row of (assay.reagents ?? []) as Record<string, unknown>[]) {
    console.log(" ", row.name, row.per_reaction_ul);
  }
}
console.log(result.permalink);
```

Manifest inspection does not require an API key.

# CLI

```bash
npx pepkio-pcr-master-mix-calculator manifest --examples
npx pepkio-pcr-master-mix-calculator run --example qpcr_20ul_sybr
```

Pass `--base-url` and `--api-key` to override environment defaults.

# Typical Use Cases

- **SYBR qPCR 20 µL** (`qpcr_20ul_sybr`) — master mix with 10% overage for a 24-reaction panel
- **Genotyping PCR** (`genotyping_25ul_gotaq`) — GoTaq master mix with custom primer concentrations
- **Multi-assay plate** (`multi_assay_three_primers`) — consolidate reagents across three primer sets
- **Pipetting limit check** (`pipette_warning_sub_half_ul`) — flag components below 0.5 µL with dilution suggestions
- Batch planning before a multi-assay genotyping or screening run
- Automating master-mix worksheets in LIMS or CI pipelines

# Scientific Background

For each reagent, volume (µL) = (final concentration / stock concentration) × reaction volume when stock and final units match (molar or fold). Water fills the remainder so components sum to the target reaction volume.

Batch amounts multiply per-reaction volumes by reaction count and an overage factor to account for dead volume and pipetting loss. When a calculated transfer is impractically small, diluting the stock or adjusting concentrations reduces pipetting error.

Enzyme activity (U/µL) is not supported—express enzyme and buffer inputs as fold or molar units.

# Web Application

For researchers who prefer a graphical interface, an interactive web version is available.

Web Application: https://www.pepkio.com/tools/pcr-master-mix-calculator

The web UI adds a printable bench sheet, visual review of assay recipes, and shareable links equivalent to API permalink values.

# Documentation and Resources

GitHub Repository: https://github.com/pepkio/pepkio-pcr-master-mix-calculator-js

Web Application: https://www.pepkio.com/tools/pcr-master-mix-calculator

Python client (PyPI): https://pypi.org/project/pepkio-pcr-master-mix-calculator/

# About Pepkio

Pepkio (https://www.pepkio.com/) develops software tools and bioinformatics solutions for life science researchers, including laboratory calculators and analysis services.
