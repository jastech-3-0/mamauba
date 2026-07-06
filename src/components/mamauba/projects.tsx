"use client";

import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Train,
  Sprout,
  GraduationCap,
  Microscope,
  HeartPulse,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";
import { Locale } from "@/lib/i18n/dictionary";

type Campaign = {
  id: string;
  slug: string;
  title: string;
  titleEn: string;
  titlePt: string;
  description: string;
  descEn: string;
  descPt: string;
  category: string;
  goal: number;
  raised: number;
  backers: number;
  cover: string | null;
};

const CATEGORY_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  ferreo: Train,
  agro: Sprout,
  educacion: GraduationCap,
  cultura: Microscope,
  salud: HeartPulse,
};

const CATEGORY_COLOR: Record<string, string> = {
  ferreo: "bg-terra/12 text-terra",
  agro: "bg-forest/12 text-forest",
  educacion: "bg-ochre/15 text-ochre",
  cultura: "bg-clay/12 text-clay",
  salud: "bg-terra/12 text-terra-dark",
};

function formatMoney(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

type Props = {
  onDonate: (campaignId?: string) => void;
};

export function Projects({ onDonate }: Props) {
  const { t, locale } = useI18n();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/convocatorias/campaigns")
      .then((r) => r.json())
      .then((d) => setCampaigns(d.campaigns ?? []))
      .finally(() => setLoading(false));
  }, []);

  const titleOf = (c: Campaign) =>
    locale === "en" ? c.titleEn : locale === "pt" ? c.titlePt : c.title;
  const descOf = (c: Campaign) =>
    locale === "en" ? c.descEn : locale === "pt" ? c.descPt : c.description;

  return (
    <section id="projects" className="section-pad bg-secondary/30">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <Badge variant="secondary" className="mb-4 bg-cream text-terra-dark">
            {t("projects.kicker")}
          </Badge>
          <h2 className="font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            {t("projects.title")}
          </h2>
          <p className="mt-5 text-base text-muted-foreground md:text-lg">
            {t("projects.subtitle")}
          </p>
        </div>

        {loading ? (
          <div className="mt-14 flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-terra" />
          </div>
        ) : (
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {campaigns.map((c) => {
              const Icon = CATEGORY_ICON[c.category] ?? Sprout;
              const pct = c.goal > 0 ? Math.min(100, Math.round((c.raised / c.goal) * 100)) : 0;
              return (
                <Card
                  key={c.id}
                  className="flex flex-col overflow-hidden p-0 transition-all hover:-translate-y-1 hover:shadow-lg"
                >
                  <div
                    className={`relative h-32 w-full ${
                      CATEGORY_COLOR[c.category] ?? "bg-secondary"
                    } flex items-end p-4`}
                  >
                    <Icon className="absolute right-3 top-3 h-6 w-6 opacity-40" />
                    <Badge className="bg-background/90 text-foreground backdrop-blur">
                      {titleOf(c).split(" ")[0]}
                    </Badge>
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="font-display text-lg font-semibold leading-snug text-foreground">
                      {titleOf(c)}
                    </h3>
                    <p className="mt-2 flex-1 text-sm text-muted-foreground line-clamp-3">
                      {descOf(c)}
                    </p>

                    <div className="mt-4 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-terra-dark">
                          {formatMoney(c.raised)}
                        </span>
                        <span className="text-muted-foreground">
                          {t("projects.goal")}: {formatMoney(c.goal)}
                        </span>
                      </div>
                      <Progress value={pct} className="h-2 bg-secondary" />
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{pct}% · {t("projects.progress")}</span>
                        <span>
                          {c.backers} {t("projects.backers")}
                        </span>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDonate(c.id)}
                      className="mt-4 w-full gap-1.5 border-terra/40 text-terra-dark hover:bg-terra/10"
                    >
                      {t("projects.donate")}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
