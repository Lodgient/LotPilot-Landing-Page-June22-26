"use client";

import Icon from "@/components/Icon";

/* eslint-disable @typescript-eslint/no-explicit-any */

function escapeCsv(v: any): string {
  const s = v === null || v === undefined ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function ExportCsv({
  filename,
  columns,
  rows,
  label = "Export CSV",
}: {
  filename: string;
  columns: { key: string; label: string }[];
  rows: Record<string, any>[];
  label?: string;
}) {
  function run() {
    const head = columns.map((c) => escapeCsv(c.label)).join(",");
    const body = rows
      .map((r) => columns.map((c) => escapeCsv(r[c.key])).join(","))
      .join("\n");
    const blob = new Blob([`${head}\n${body}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      onClick={run}
      className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line-strong bg-white/[0.03] px-3 text-sm text-ink-soft transition-colors hover:border-cyan/50 hover:text-ink"
    >
      <Icon name="download" size={14} /> {label}
    </button>
  );
}

export function PrintButton({ label = "Print / PDF" }: { label?: string }) {
  return (
    <button
      onClick={() => window.print()}
      className="no-print inline-flex h-9 items-center gap-1.5 rounded-lg border border-line-strong bg-white/[0.03] px-3 text-sm text-ink-soft transition-colors hover:border-cyan/50 hover:text-ink"
    >
      <Icon name="printer" size={14} /> {label}
    </button>
  );
}
