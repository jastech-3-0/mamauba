"use client";

import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Users,
  FolderKanban,
  Send,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
} from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";

type Movement = {
  id: string;
  type: "in" | "out";
  amount: number;
  currency: string;
  concept: string;
  date: string;
};

function formatMoney(n: number, c = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: c,
    maximumFractionDigits: 0,
  }).format(n);
}

export function Transparency() {
  const { t } = useI18n();
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/convocatorias/movements")
      .then((r) => r.json())
      .then((d) => setMovements(d.movements ?? []))
      .finally(() => setLoading(false));
  }, []);

  const totalIn = movements.filter((m) => m.type === "in").reduce((s, m) => s + m.amount, 0);
  const totalOut = movements.filter((m) => m.type === "out").reduce((s, m) => s + m.amount, 0);
  const executedPct = totalIn > 0 ? Math.round((totalOut / totalIn) * 100) : 0;
  const adminPct = 8; // Demo value
  const donorsCount = 312;
  const projectsCount = 5;
  const callsCount = 8;

  // Chart bars (last 6 months simulated from movements)
  const monthly = [
    { label: "Feb", in: 42, out: 28 },
    { label: "Mar", in: 65, out: 41 },
    { label: "Abr", in: 38, out: 52 },
    { label: "May", in: 92, out: 48 },
    { label: "Jun", in: 71, out: 63 },
    { label: "Jul", in: 84, out: 57 },
  ];
  const maxVal = Math.max(...monthly.flatMap((m) => [m.in, m.out]));

  const metrics = [
    {
      label: t("trans.metric.raised"),
      value: formatMoney(totalIn),
      icon: TrendingUp,
      color: "text-forest",
      bg: "bg-forest/10",
    },
    {
      label: t("trans.metric.executed"),
      value: `${formatMoney(totalOut)} (${executedPct}%)`,
      icon: TrendingDown,
      color: "text-terra-dark",
      bg: "bg-terra/10",
    },
    {
      label: t("trans.metric.admin"),
      value: `${adminPct}%`,
      icon: Wallet,
      color: "text-ochre",
      bg: "bg-ochre/10",
    },
    {
      label: t("trans.metric.donors"),
      value: donorsCount.toString(),
      icon: Users,
      color: "text-terra",
      bg: "bg-terra/10",
    },
    {
      label: t("trans.metric.projects"),
      value: projectsCount.toString(),
      icon: FolderKanban,
      color: "text-forest",
      bg: "bg-forest/10",
    },
    {
      label: t("trans.metric.calls"),
      value: callsCount.toString(),
      icon: Send,
      color: "text-clay",
      bg: "bg-clay/10",
    },
  ];

  return (
    <section id="transparency" className="section-pad bg-secondary/30">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <Badge variant="secondary" className="mb-4 bg-cream text-terra-dark">
            {t("trans.kicker")}
          </Badge>
          <h2 className="font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            {t("trans.title")}
          </h2>
          <p className="mt-5 text-base text-muted-foreground md:text-lg">
            {t("trans.subtitle")}
          </p>
        </div>

        {/* Metrics */}
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {metrics.map((m, i) => (
            <Card key={i} className="flex items-center gap-4 p-5">
              <div className={`inline-flex h-12 w-12 items-center justify-center rounded-lg ${m.bg}`}>
                <m.icon className={`h-5 w-5 ${m.color}`} />
              </div>
              <div>
                <div className="font-display text-xl font-bold text-foreground">{m.value}</div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">
                  {m.label}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Chart + recent movements */}
        <div className="mt-8 grid gap-6 lg:grid-cols-5">
          <Card className="p-6 lg:col-span-3">
            <h3 className="mb-4 font-display text-base font-semibold text-foreground">
              {t("trans.flow.title")}
            </h3>
            <div className="flex h-56 items-end justify-around gap-3">
              {monthly.map((m) => (
                <div key={m.label} className="flex flex-1 flex-col items-center gap-2">
                  <div className="flex h-full w-full items-end justify-center gap-1">
                    <div
                      className="w-1/2 rounded-t bg-forest/80 transition-all hover:bg-forest"
                      style={{ height: `${(m.in / maxVal) * 100}%` }}
                      title={`In: ${m.in}k`}
                    />
                    <div
                      className="w-1/2 rounded-t bg-terra/80 transition-all hover:bg-terra"
                      style={{ height: `${(m.out / maxVal) * 100}%` }}
                      title={`Out: ${m.out}k`}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground">{m.label}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-center gap-6 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-forest/80" />
                {t("trans.flow.in")}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-terra/80" />
                {t("trans.flow.out")}
              </span>
            </div>
          </Card>

          <Card className="p-6 lg:col-span-2">
            <h3 className="mb-4 font-display text-base font-semibold text-foreground">
              {t("trans.recent.title")}
            </h3>
            {loading ? (
              <div className="flex justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <ul className="space-y-2 max-h-72 overflow-y-auto scroll-warm pr-1">
                {movements.map((m) => (
                  <li
                    key={m.id}
                    className="flex items-start gap-3 rounded-md border border-border/60 p-2.5"
                  >
                    <div
                      className={`mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                        m.type === "in"
                          ? "bg-forest/15 text-forest"
                          : "bg-terra/15 text-terra-dark"
                      }`}
                    >
                      {m.type === "in" ? (
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      ) : (
                        <ArrowDownRight className="h-3.5 w-3.5" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-foreground">{m.concept}</div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        {new Date(m.date).toLocaleDateString()}
                      </div>
                    </div>
                    <div
                      className={`font-display text-sm font-semibold ${
                        m.type === "in" ? "text-forest" : "text-terra-dark"
                      }`}
                    >
                      {m.type === "in" ? "+" : "−"}
                      {formatMoney(m.amount, m.currency)}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </section>
  );
}
