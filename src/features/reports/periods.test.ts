import { describe, expect, it } from "vitest";
import { getReportPeriods } from "./periods";

describe("getReportPeriods", () => {
  it("builds the predefined periods from the local business date", () => {
    expect(getReportPeriods("2026-10-14")).toEqual([
      { label: "Ontem", start: "2026-10-13", end: "2026-10-13" },
      {
        label: "Últimos 7 dias",
        start: "2026-10-08",
        end: "2026-10-14",
      },
      { label: "Este mês", start: "2026-10-01", end: "2026-10-14" },
      {
        label: "Últimos 3 meses",
        start: "2026-08-01",
        end: "2026-10-14",
      },
      {
        label: "Este semestre",
        start: "2026-07-01",
        end: "2026-10-14",
      },
      { label: "Este ano", start: "2026-01-01", end: "2026-10-14" },
      {
        label: "Últimos 12 meses",
        start: "2025-11-01",
        end: "2026-10-14",
      },
    ]);
  });
});
