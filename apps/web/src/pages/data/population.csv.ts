import { data, geographies, metrics } from "../../data";
const escape = (s: string | number) => `"${String(s).replaceAll('"', '""')}"`;
export function GET() {
  const header = [
    "geography_code",
    "geography",
    "metric",
    "value",
    "unit",
    "period",
    "source_url",
    "source_sha256",
    "source_row",
    "source_column",
    "retrieved_at",
    "revision",
    "verification",
  ];
  const rows = data.observations.map((o) => {
    const s = data.snapshots.find((s) => s.id === o.sourceId)!;
    return [
      o.geography,
      geographies.find((g) => g.code === o.geography)!.name,
      o.metric,
      o.value,
      metrics.find((m) => m.id === o.metric)!.unit,
      o.period,
      s.url,
      s.sha256,
      o.row,
      o.column,
      s.retrievedAt,
      o.revision,
      o.status,
    ]
      .map(escape)
      .join(",");
  });
  return new Response(
    "\uFEFF" + header.join(",") + "\r\n" + rows.join("\r\n"),
    { headers: { "Content-Type": "text/csv; charset=utf-8" } },
  );
}
