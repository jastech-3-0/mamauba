"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Globe2,
  HandCoins,
  Languages,
  ArrowRight,
  HeartHandshake,
  Train,
  Leaf,
  GraduationCap,
  Cpu,
} from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";

type Props = {
  onDonate: () => void;
  onExploreAi: () => void;
};

export function Hero({ onDonate, onExploreAi }: Props) {
  const { t } = useI18n();

  const stats = [
    { label: t("hero.stat.founded"), value: t("hero.stat.founded.value") },
    { label: t("hero.stat.scope"), value: t("hero.stat.scope.value") },
    { label: t("hero.stat.modalities"), value: t("hero.stat.modalities.value") },
    { label: t("hero.stat.languages"), value: t("hero.stat.languages.value") },
  ];

  const pillars = [
    { icon: Train, color: "text-terra" },
    { icon: Leaf, color: "text-forest" },
    { icon: GraduationCap, color: "text-ochre" },
    { icon: Cpu, color: "text-clay" },
  ];

  return (
    <section
      id="top"
      className="relative overflow-hidden bg-grain pt-20 pb-24 md:pt-28 md:pb-32"
    >
      {/* Decorative blobs */}
      <div
        aria-hidden
        className="animate-blob absolute -top-20 -left-20 h-72 w-72 rounded-full bg-terra/15 blur-3xl"
      />
      <div
        aria-hidden
        className="animate-blob absolute top-32 right-0 h-96 w-96 rounded-full bg-ochre/15 blur-3xl"
        style={{ animationDelay: "-4s" }}
      />
      <div
        aria-hidden
        className="animate-blob absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-forest/12 blur-3xl"
        style={{ animationDelay: "-8s" }}
      />

      <div className="relative mx-auto max-w-7xl px-4 md:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <Badge
            variant="secondary"
            className="mb-5 gap-1.5 rounded-full border border-terra/30 bg-cream px-4 py-1.5 text-xs font-semibold text-terra-dark"
          >
            <Sparkles className="h-3.5 w-3.5" />
            {t("hero.kicker")}
          </Badge>

          <h1 className="font-display text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl md:text-6xl">
            <span className="block">{t("hero.title.1")}</span>
            <span className="mt-2 block text-gradient-warm">
              {t("hero.title.2")}
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground md:text-lg">
            {t("hero.subtitle")}
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              size="lg"
              onClick={onDonate}
              className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90 sm:w-auto"
            >
              <HandCoins className="h-4 w-4" />
              {t("hero.cta.donate")}
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={onExploreAi}
              className="w-full gap-2 border-terra/40 text-terra-dark hover:bg-terra/10 sm:w-auto"
            >
              <Sparkles className="h-4 w-4" />
              {t("hero.cta.explore")}
            </Button>
          </div>

          {/* Pillars */}
          <div className="mt-8 flex items-center justify-center gap-6 text-muted-foreground">
            {pillars.map((p, i) => (
              <p.icon
                key={i}
                className={`h-6 w-6 ${p.color}`}
                aria-hidden
              />
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="mx-auto mt-16 grid max-w-5xl grid-cols-2 gap-4 md:grid-cols-4">
          {stats.map((s, i) => (
            <Card
              key={i}
              className="glass-card border-border/60 bg-card/80 p-5 text-center"
            >
              <div className="font-display text-xl font-bold text-terra-dark md:text-2xl">
                {s.value}
              </div>
              <div className="mt-1 text-xs uppercase tracking-wider text-muted-foreground md:text-sm">
                {s.label}
              </div>
            </Card>
          ))}
        </div>

        {/* Trust strip */}
        <div className="mx-auto mt-12 flex max-w-3xl flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Globe2 className="h-3.5 w-3.5 text-terra" />
            Envigado, Antioquia · Colombia
          </span>
          <span className="inline-flex items-center gap-1.5">
            <HeartHandshake className="h-3.5 w-3.5 text-forest" />
            ESAL · Personería 55.0000002409.12
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Languages className="h-3.5 w-3.5 text-ochre" />
            ES · EN · PT
          </span>
        </div>
      </div>
    </section>
  );
}
