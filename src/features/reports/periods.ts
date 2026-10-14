export type ReportPeriod = {
  label: string;
  start: string;
  end: string;
};

function formatIsoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function addUtcDays(date: Date, days: number) {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

export function getReportPeriods(todayIso: string): ReportPeriod[] {
  const [year, month, day] = todayIso.split("-").map(Number);
  const today = new Date(Date.UTC(year, month - 1, day));
  const yesterday = addUtcDays(today, -1);

  return [
    {
      label: "Ontem",
      start: formatIsoDate(yesterday),
      end: formatIsoDate(yesterday),
    },
    {
      label: "Últimos 7 dias",
      start: formatIsoDate(addUtcDays(today, -6)),
      end: todayIso,
    },
    {
      label: "Este mês",
      start: formatIsoDate(new Date(Date.UTC(year, month - 1, 1))),
      end: todayIso,
    },
    {
      label: "Últimos 3 meses",
      start: formatIsoDate(new Date(Date.UTC(year, month - 3, 1))),
      end: todayIso,
    },
    {
      label: "Este semestre",
      start: formatIsoDate(new Date(Date.UTC(year, month <= 6 ? 0 : 6, 1))),
      end: todayIso,
    },
    {
      label: "Este ano",
      start: `${year}-01-01`,
      end: todayIso,
    },
    {
      label: "Últimos 12 meses",
      start: formatIsoDate(new Date(Date.UTC(year, month - 12, 1))),
      end: todayIso,
    },
  ];
}
