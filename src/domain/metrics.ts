import { hash, canonical } from "@/platform/crypto";
export const metricDefinitions = [
  {
    metricKey: "kpi.001",
    revision: 1,
    meaning: "Confirmed starts",
    formula:
      "Distinct currently-started placement IDs with actual start in the inclusive calendar-date range.",
  },
  {
    metricKey: "kpi.002",
    revision: 1,
    meaning: "On-time start rate",
    formula:
      "Started original-plan cohort with actual<=original / all started original-plan cohort *100; null on zero denominator. Canceled and unresolved shown separately.",
  },
  {
    metricKey: "kpi.003",
    revision: 1,
    meaning: "Overdue required tasks",
    formula:
      "Required unfinished/nonwaived tasks on nonterminal authorized placements with due instant before asOf. Current snapshot only.",
  },
  {
    metricKey: "kpi.004",
    revision: 1,
    meaning: "Median nonnegative delay",
    formula:
      "Median max(0,actual-original) calendar days across started original-plan cohort; null on empty cohort.",
  },
].map((d) => ({ ...d, definitionHash: hash(canonical(d)) }));
