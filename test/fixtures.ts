export const mockManifest: Record<string, unknown> = {
  tool_id: "pcr-master-mix-calculator",
  title: "PCR Master Mix Calculator",
  execution_mode: "sync",
  examples: [
    {
      name: "qpcr_20ul_sybr",
      input: {
        assays: [
          {
            name: "SYBR panel",
            reaction_volume_ul: 20,
            reaction_count: 24,
            overage_factor: 1.1,
            reagents: [
              {
                name: "10× PCR buffer",
                stock_value: 10,
                stock_unit: "fold",
                final_value: 1,
                final_unit: "fold",
              },
              {
                name: "dNTP mix",
                stock_value: 10,
                stock_unit: "mM",
                final_value: 0.2,
                final_unit: "mM",
              },
              {
                name: "Forward primer",
                stock_value: 10,
                stock_unit: "uM",
                final_value: 0.4,
                final_unit: "uM",
              },
              {
                name: "Reverse primer",
                stock_value: 10,
                stock_unit: "uM",
                final_value: 0.4,
                final_unit: "uM",
              },
              {
                name: "Taq",
                stock_value: 1,
                stock_unit: "fold",
                final_value: 0.02,
                final_unit: "fold",
              },
              {
                name: "Water",
                stock_value: 1,
                stock_unit: "fold",
                final_value: 1,
                final_unit: "fold",
                is_water: true,
              },
            ],
          },
        ],
      },
      output: { has_blocking_errors: false },
    },
    {
      name: "genotyping_25ul_gotaq",
      input: {
        assays: [
          {
            name: "Genotyping",
            reaction_volume_ul: 25,
            reaction_count: 48,
            overage_factor: 1.1,
            reagents: [
              {
                name: "2× GoTaq MM",
                stock_value: 2,
                stock_unit: "fold",
                final_value: 1,
                final_unit: "fold",
              },
              {
                name: "Forward primer",
                stock_value: 10,
                stock_unit: "uM",
                final_value: 0.5,
                final_unit: "uM",
              },
              {
                name: "Reverse primer",
                stock_value: 10,
                stock_unit: "uM",
                final_value: 0.5,
                final_unit: "uM",
              },
              {
                name: "Water",
                stock_value: 1,
                stock_unit: "fold",
                final_value: 1,
                final_unit: "fold",
                is_water: true,
              },
            ],
          },
        ],
      },
      output: { has_blocking_errors: false },
    },
    {
      name: "multi_assay_three_primers",
      input: {
        assays: [
          {
            name: "Assay A",
            reaction_volume_ul: 20,
            reaction_count: 12,
            overage_factor: 1.1,
            reagents: [
              {
                name: "10× buffer",
                stock_value: 10,
                stock_unit: "fold",
                final_value: 1,
                final_unit: "fold",
              },
              {
                name: "dNTP",
                stock_value: 10,
                stock_unit: "mM",
                final_value: 0.2,
                final_unit: "mM",
              },
              {
                name: "Primer",
                stock_value: 10,
                stock_unit: "uM",
                final_value: 0.4,
                final_unit: "uM",
              },
              {
                name: "Water",
                stock_value: 1,
                stock_unit: "fold",
                final_value: 1,
                final_unit: "fold",
                is_water: true,
              },
            ],
          },
        ],
      },
      output: { has_blocking_errors: false },
    },
  ],
};

export const mockRunResponse: Record<string, unknown> = {
  run_id: "run_test123",
  status: "completed",
  result: {
    has_blocking_errors: false,
    assays: [
      {
        name: "SYBR panel",
        total_reactions: 27,
        reagents: [
          { name: "10× PCR buffer", per_reaction_ul: 2, status: "ok" },
          { name: "Water", per_reaction_ul: 15.6, is_water: true, status: "ok" },
        ],
        water_per_reaction_ul: 15.6,
      },
    ],
    consolidated: [{ name: "10× PCR buffer", total_volume_ul: 54 }],
    warnings: [],
  },
  error: null,
  result_url: "https://tools.pepkio.com/api/tools/v1/runs/run_test123",
  permalink: "https://tools.pepkio.com/r/run_test123",
};
