"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Target,
  Eye,
  Scale,
  Users,
  CalendarDays,
  Coins,
  CheckCircle2,
  Building2,
  FileText,
} from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";
import { MAMAUBA_INFO, TEAM, FOUNDERS } from "@/lib/mamauba-data";

export function About() {
  const { t, locale } = useI18n();

  const roleLabels: Record<string, string> = {
    director: t("about.team.role.director"),
    deputy: t("about.team.role.deputy"),
    secretary: t("about.team.role.secretary"),
  };

  return (
    <section id="about" className="section-pad bg-background">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <Badge variant="secondary" className="mb-4 gap-1.5 bg-secondary text-terra-dark">
            <Building2 className="h-3.5 w-3.5" />
            {t("about.kicker")}
          </Badge>
          <h2 className="font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            {t("about.title")}
          </h2>
          <p className="mt-5 text-base text-muted-foreground md:text-lg">
            {t("about.lead")}
          </p>
        </div>

        {/* Mission / Vision / Legal */}
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          <Card className="p-6 transition-shadow hover:shadow-md">
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-terra/12 text-terra">
              <Target className="h-5 w-5" />
            </div>
            <h3 className="font-display text-lg font-semibold text-foreground">
              {t("about.mission.title")}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {t("about.mission.body")}
            </p>
          </Card>

          <Card className="p-6 transition-shadow hover:shadow-md">
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-ochre/15 text-ochre">
              <Eye className="h-5 w-5" />
            </div>
            <h3 className="font-display text-lg font-semibold text-foreground">
              {t("about.vision.title")}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {t("about.vision.body")}
            </p>
          </Card>

          <Card className="p-6 transition-shadow hover:shadow-md">
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-forest/12 text-forest">
              <Scale className="h-5 w-5" />
            </div>
            <h3 className="font-display text-lg font-semibold text-foreground">
              {t("about.legal.title")}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {t("about.legal.body")}
            </p>
          </Card>
        </div>

        {/* Data sheet */}
        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {/* Identity */}
          <Card className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-terra" />
              <h3 className="font-display text-base font-semibold text-foreground">
                Identidad jurídica
              </h3>
            </div>
            <dl className="space-y-2.5 text-sm">
              <Row label="Razón social" value={MAMAUBA_INFO.name} />
              <Row label="NIT" value={MAMAUBA_INFO.nit} />
              <Row label="Tipo" value={MAMAUBA_INFO.type} />
              <Row label="Personería jurídica" value={MAMAUBA_INFO.legalPersonality} />
              <Row label="Registro C.C." value={MAMAUBA_INFO.registration} />
              <Row label="Libro" value={MAMAUBA_INFO.book} />
              <Row label="Vigilancia" value={MAMAUBA_INFO.inspection} />
              <Row label="CIIU" value={MAMAUBA_INFO.ciiu} />
              <Row label="NIIF" value={MAMAUBA_INFO.niifGroup} />
            </dl>
          </Card>

          {/* Team */}
          <Card className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-terra" />
              <h3 className="font-display text-base font-semibold text-foreground">
                {t("about.team.title")}
              </h3>
            </div>
            <ul className="space-y-3">
              {TEAM.map((m) => (
                <li key={m.id} className="rounded-lg border border-border/60 bg-secondary/40 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-sm font-semibold text-foreground">{m.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {roleLabels[m.role] ?? m.role}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[10px]">
                      {m.id}
                    </Badge>
                  </div>
                  <div className="mt-1.5 text-xs text-muted-foreground">{m.city}</div>
                </li>
              ))}
            </ul>
          </Card>

          {/* Founders + patrimony */}
          <Card className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <Coins className="h-5 w-5 text-terra" />
              <h3 className="font-display text-base font-semibold text-foreground">
                {t("about.founder.title")}
              </h3>
            </div>
            <ul className="space-y-2 text-sm">
              {FOUNDERS.map((f) => (
                <li key={f.id} className="flex items-center justify-between">
                  <span className="text-foreground">{f.name}</span>
                  <span className="text-xs text-muted-foreground">{f.id}</span>
                </li>
              ))}
            </ul>
            <Separator className="my-4" />
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-terra/8 p-3">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Coins className="h-3.5 w-3.5" />
                  {t("about.patrimony.title")}
                </div>
                <div className="mt-1 font-display text-base font-bold text-terra-dark">
                  {t("about.patrimony.value")}
                </div>
              </div>
              <div className="rounded-lg bg-forest/8 p-3">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {t("about.duration.title")}
                </div>
                <div className="mt-1 font-display text-base font-bold text-forest">
                  {t("about.duration.value")}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Tax responsibilities */}
        <Card className="mt-6 p-6">
          <div className="mb-3 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-forest" />
            <h3 className="font-display text-base font-semibold text-foreground">
              Responsabilidades tributarias (DIAN)
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {MAMAUBA_INFO.taxResponsibilities.map((r) => (
              <Badge
                key={r}
                variant="secondary"
                className="bg-forest/10 text-forest font-normal"
              >
                {r}
              </Badge>
            ))}
          </div>
        </Card>
      </div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-xs uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd className="text-right text-sm font-medium text-foreground">{value}</dd>
    </div>
  );
}
