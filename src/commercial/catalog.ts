export const commercialCatalog = {
  version: "r1-pricing-experiment-2026-11-02",
  currency: "GHS",
  priceStatus: "Proposed experiment; not an approved offer",
  plans: [
    {
      id: "trial",
      name: "Evaluation",
      monthlyMinor: 0,
      days: 14,
      seats: 5,
      placements: 25,
      entities: 1,
    },
    {
      id: "starter",
      name: "Starter",
      monthlyMinor: 100000,
      days: null,
      seats: 10,
      placements: 100,
      entities: 1,
    },
    {
      id: "growth",
      name: "Growth",
      monthlyMinor: 250000,
      days: null,
      seats: 30,
      placements: 500,
      entities: 3,
    },
  ],
  modules: [
    { id: "platform.core", name: "Company, access and subscription controls" },
    { id: "crm.accounts", name: "Client and contact references" },
    {
      id: "agency.starts",
      name: "Placement checklists, client participation and daily digest",
    },
    {
      id: "platform.analytics",
      name: "Agency metrics and PDF / CSV / XLSX reports",
    },
    { id: "platform.integrations", name: "Validated CSV import" },
  ],
} as const;
