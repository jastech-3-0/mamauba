"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Sparkles,
  Search,
  Loader2,
  CheckCircle2,
  XCircle,
  Upload,
  FileText,
  Languages,
  Wand2,
  Send,
  Copy,
  Download,
  ExternalLink,
  Brain,
  Cpu,
  Network,
  AlertTriangle,
} from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";
import { useToast } from "@/hooks/use-toast";

type Match = {
  convocatoriaId: string;
  convocatoriaName: string;
  funder: string;
  country: string;
  language: string;
  maxAmount: number;
  currency: string;
  deadline: string;
  category: string;
  eligibility: string;
  url: string | null;
  score: number;
  rationale: string;
};

type ChecklistItem = {
  slug: string;
  name: string;
  required: boolean;
  language: string;
  status: "have" | "missing";
  notes: string;
};

const LANG_NAMES: Record<string, string> = {
  es: "Español",
  en: "English",
  pt: "Português",
  fr: "Français",
};

function formatMoney(n: number, c: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: c,
    maximumFractionDigits: 0,
  }).format(n);
}

export function AiPanel() {
  const { t } = useI18n();
  const { toast } = useToast();

  const [query, setQuery] = useState("");
  const [matches, setMatches] = useState<Match[]>([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<Match | null>(null);
  const [activeTab, setActiveTab] = useState("match");

  // Checklist
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [checklistLoading, setChecklistLoading] = useState(false);

  // Translation
  const [translating, setTranslating] = useState(false);
  const [translation, setTranslation] = useState<{ original: string; translated: string; target: string } | null>(null);

  // Pitch
  const [pitch, setPitch] = useState<string>("");
  const [pitching, setPitching] = useState(false);

  // Apply
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);

  const search = async () => {
    setSearching(true);
    setSelected(null);
    setMatches([]);
    setChecklist([]);
    setTranslation(null);
    setPitch("");
    setApplied(false);
    try {
      const res = await fetch("/api/ai/match-convocatorias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      setMatches(data.matches ?? []);
    } finally {
      setSearching(false);
    }
  };

  const selectConv = async (m: Match) => {
    setSelected(m);
    setActiveTab("checklist");
    setChecklistLoading(true);
    setChecklist([]);
    setTranslation(null);
    setPitch("");
    setApplied(false);
    try {
      const res = await fetch("/api/ai/document-checklist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ convocatoriaId: m.convocatoriaId }),
      });
      const data = await res.json();
      setChecklist(data.checklist ?? []);
    } finally {
      setChecklistLoading(false);
    }
  };

  const translate = async (item?: ChecklistItem) => {
    setTranslating(true);
    setTranslation(null);
    try {
      const res = await fetch("/api/ai/translate-docs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          convocatoriaId: selected?.convocatoriaId,
          documentSlug: item?.slug,
          documentName: item?.name,
          sourceLanguage: "es",
          targetLanguage: selected?.language ?? "en",
        }),
      });
      const data = await res.json();
      setTranslation({
        original: data.original,
        translated: data.translated,
        target: data.targetLanguage,
      });
      setActiveTab("translate");
    } finally {
      setTranslating(false);
    }
  };

  const generatePitch = async () => {
    if (!selected) return;
    setPitching(true);
    setPitch("");
    try {
      const res = await fetch("/api/ai/generate-pitch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          convocatoriaId: selected.convocatoriaId,
          query,
          language: selected.language,
        }),
      });
      const data = await res.json();
      setPitch(data.pitch ?? "");
      setActiveTab("pitch");
    } finally {
      setPitching(false);
    }
  };

  const apply = async () => {
    setApplying(true);
    await new Promise((r) => setTimeout(r, 1500));
    setApplying(false);
    setApplied(true);
    toast({ title: t("ai.apply.done"), description: selected?.convocatoriaName });
  };

  const copyPitch = () => {
    navigator.clipboard.writeText(pitch);
    toast({ title: "Pitch copiado" });
  };

  const downloadPitch = () => {
    const blob = new Blob([pitch], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pitch-mamauba-${selected?.funder ?? "convocatoria"}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const haveCount = checklist.filter((c) => c.status === "have").length;
  const missingCount = checklist.filter((c) => c.status === "missing").length;

  return (
    <section id="ai" className="section-pad bg-background relative overflow-hidden">
      <div aria-hidden className="absolute inset-0 bg-grain opacity-50" />

      <div className="relative mx-auto max-w-7xl px-4 md:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <Badge variant="secondary" className="mb-4 gap-1.5 bg-terra/10 text-terra-dark">
            <Brain className="h-3.5 w-3.5" />
            {t("ai.kicker")}
          </Badge>
          <h2 className="font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            {t("ai.title")}
          </h2>
          <p className="mt-5 text-base text-muted-foreground md:text-lg">
            {t("ai.subtitle")}
          </p>

          {/* Tech badges */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <Badge variant="outline" className="gap-1 border-terra/30 text-terra-dark">
              <Cpu className="h-3 w-3" /> LLM
            </Badge>
            <Badge variant="outline" className="gap-1 border-forest/30 text-forest">
              <Network className="h-3 w-3" /> Neural network
            </Badge>
            <Badge variant="outline" className="gap-1 border-ochre/30 text-ochre">
              <Languages className="h-3 w-3" /> Translation
            </Badge>
            <Badge variant="outline" className="gap-1 border-clay/30 text-clay">
              <Sparkles className="h-3 w-3" /> Auto-apply
            </Badge>
          </div>
        </div>

        <Card className="mt-12 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b border-border bg-secondary/40 p-3">
              <TabsList className="grid w-full grid-cols-2 gap-1 md:grid-cols-5">
                <TabsTrigger value="match" className="gap-1.5 text-xs md:text-sm">
                  <Search className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{t("ai.tab.match")}</span>
                </TabsTrigger>
                <TabsTrigger value="checklist" className="gap-1.5 text-xs md:text-sm" disabled={!selected}>
                  <FileText className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{t("ai.tab.checklist")}</span>
                </TabsTrigger>
                <TabsTrigger value="translate" className="gap-1.5 text-xs md:text-sm" disabled={!selected}>
                  <Languages className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{t("ai.tab.translate")}</span>
                </TabsTrigger>
                <TabsTrigger value="pitch" className="gap-1.5 text-xs md:text-sm" disabled={!selected}>
                  <Wand2 className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{t("ai.tab.pitch")}</span>
                </TabsTrigger>
                <TabsTrigger value="apply" className="gap-1.5 text-xs md:text-sm" disabled={!selected}>
                  <Send className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{t("ai.tab.apply")}</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* MATCH */}
            <TabsContent value="match" className="p-5 md:p-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="md:col-span-2">
                  <Label className="mb-2 block text-sm font-medium">
                    {t("ai.match.title")}
                  </Label>
                  <p className="mb-3 text-xs text-muted-foreground">{t("ai.match.subtitle")}</p>
                  <Textarea
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={t("ai.match.input.ph")}
                    rows={4}
                    className="resize-none"
                  />
                  <Button
                    onClick={search}
                    disabled={searching}
                    className="mt-3 w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90 sm:w-auto"
                  >
                    {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                    {searching ? t("ai.match.searching") : t("ai.match.button")}
                  </Button>
                </div>
                <div className="rounded-lg border border-dashed border-border bg-secondary/30 p-4 text-xs">
                  <div className="mb-2 font-semibold text-foreground">How it works</div>
                  <ol className="space-y-1.5 text-muted-foreground">
                    <li>1. La red neuronal analiza el perfil jurídico de Mamauba.</li>
                    <li>2. Busca en el catálogo de cooperación internacional.</li>
                    <li>3. Calcula un score de compatibilidad 0-100.</li>
                    <li>4. Devuelve las convocatorias con mejor fit.</li>
                  </ol>
                </div>
              </div>

              {matches.length > 0 && (
                <div className="mt-6">
                  <div className="mb-3 text-sm font-semibold text-foreground">
                    {t("ai.match.results")} ({matches.length})
                  </div>
                  <div className="grid gap-3">
                    {matches.map((m) => (
                      <Card
                        key={m.convocatoriaId}
                        className={`cursor-pointer border p-4 transition-all hover:-translate-y-0.5 hover:shadow-md ${
                          selected?.convocatoriaId === m.convocatoriaId
                            ? "border-primary ring-2 ring-primary/30"
                            : "border-border"
                        }`}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-display text-base font-semibold text-foreground">
                                {m.convocatoriaName}
                              </h4>
                              {m.url && (
                                <a
                                  href={m.url}
                                  target="_blank"
                                  rel="noreferrer noopener"
                                  className="text-muted-foreground hover:text-primary"
                                  aria-label="Open convocatoria"
                                >
                                  <ExternalLink className="h-3.5 w-3.5" />
                                </a>
                              )}
                            </div>
                            <div className="mt-0.5 flex flex-wrap gap-2 text-xs text-muted-foreground">
                              <span className="font-medium text-foreground">{m.funder}</span>
                              <span>· {m.country}</span>
                              <span>· {t("ai.match.language")}: {LANG_NAMES[m.language] ?? m.language}</span>
                              <span>· {t("ai.match.deadline")}: {m.deadline}</span>
                            </div>
                            <p className="mt-2 text-sm text-muted-foreground">{m.rationale}</p>
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              <Badge variant="secondary" className="bg-terra/10 text-terra-dark">
                                {t("ai.match.amount")}: {formatMoney(m.maxAmount, m.currency)}
                              </Badge>
                              <Badge variant="secondary" className="bg-forest/10 text-forest">
                                {t("ai.match.eligibility")}: {m.eligibility.slice(0, 80)}
                                {m.eligibility.length > 80 ? "…" : ""}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex flex-col items-center gap-2">
                            <div className="relative inline-flex h-14 w-14 items-center justify-center">
                              <svg className="h-14 w-14 -rotate-90" viewBox="0 0 36 36">
                                <circle
                                  cx="18"
                                  cy="18"
                                  r="15.9155"
                                  fill="none"
                                  stroke="oklch(0.92 0.025 85)"
                                  strokeWidth="3"
                                />
                                <circle
                                  cx="18"
                                  cy="18"
                                  r="15.9155"
                                  fill="none"
                                  stroke={
                                    m.score >= 80 ? "oklch(0.42 0.09 165)" : m.score >= 60 ? "oklch(0.78 0.16 75)" : "oklch(0.55 0.16 45)"
                                  }
                                  strokeWidth="3"
                                  strokeDasharray={`${m.score}, 100`}
                                  strokeLinecap="round"
                                />
                              </svg>
                              <span className="absolute font-display text-sm font-bold text-foreground">
                                {m.score}
                              </span>
                            </div>
                            <Button
                              size="sm"
                              variant={selected?.convocatoriaId === m.convocatoriaId ? "default" : "outline"}
                              onClick={() => selectConv(m)}
                              className="gap-1"
                            >
                              {selected?.convocatoriaId === m.convocatoriaId ? (
                                <>
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                  {t("ai.match.selected")}
                                </>
                              ) : (
                                t("ai.match.select")
                              )}
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            {/* CHECKLIST */}
            <TabsContent value="checklist" className="p-5 md:p-6">
              {!selected ? (
                <EmptyState text={t("ai.checklist.empty")} />
              ) : checklistLoading ? (
                <CenterLoader text={t("common.loading")} />
              ) : (
                <>
                  <div className="mb-4">
                    <Label className="block text-sm font-medium">{t("ai.checklist.title")}</Label>
                    <p className="mt-1 text-xs text-muted-foreground">{t("ai.checklist.subtitle")}</p>
                  </div>

                  <div className="mb-4 grid grid-cols-3 gap-2">
                    <div className="rounded-lg bg-forest/8 p-3 text-center">
                      <div className="font-display text-2xl font-bold text-forest">{haveCount}</div>
                      <div className="text-xs text-muted-foreground">{t("ai.checklist.have")}</div>
                    </div>
                    <div className="rounded-lg bg-terra/10 p-3 text-center">
                      <div className="font-display text-2xl font-bold text-terra-dark">{missingCount}</div>
                      <div className="text-xs text-muted-foreground">{t("ai.checklist.missing")}</div>
                    </div>
                    <div className="rounded-lg bg-secondary p-3 text-center">
                      <div className="font-display text-2xl font-bold text-foreground">
                        {Math.round((haveCount / (haveCount + missingCount || 1)) * 100)}%
                      </div>
                      <div className="text-xs text-muted-foreground">{t("projects.progress")}</div>
                    </div>
                  </div>

                  <Progress
                    value={(haveCount / (haveCount + missingCount || 1)) * 100}
                    className="mb-4 h-2"
                  />

                  <div className="space-y-2">
                    {checklist.map((c) => (
                      <div
                        key={c.slug}
                        className={`flex items-start gap-3 rounded-lg border p-3 ${
                          c.status === "have"
                            ? "border-forest/30 bg-forest/5"
                            : "border-terra/30 bg-terra/5"
                        }`}
                      >
                        {c.status === "have" ? (
                          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-forest" />
                        ) : (
                          <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-terra-dark" />
                        )}
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-medium text-foreground">{c.name}</span>
                            <Badge variant="outline" className="text-[10px]">
                              {LANG_NAMES[c.language] ?? c.language}
                            </Badge>
                            {!c.required && (
                              <Badge variant="outline" className="text-[10px]">
                                opcional
                              </Badge>
                            )}
                          </div>
                          <p className="mt-0.5 text-xs text-muted-foreground">{c.notes}</p>
                        </div>
                        {c.status === "missing" && (
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline" className="gap-1 text-xs">
                              <Upload className="h-3 w-3" />
                              {t("ai.checklist.upload")}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1 border-terra/40 text-terra-dark hover:bg-terra/10"
                              onClick={() => translate(c)}
                            >
                              <Sparkles className="h-3 w-3" />
                              {t("ai.checklist.generate")}
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 flex justify-end">
                    <Button onClick={() => setActiveTab("translate")} className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90">
                      {t("ai.tab.translate")}
                    </Button>
                  </div>
                </>
              )}
            </TabsContent>

            {/* TRANSLATE */}
            <TabsContent value="translate" className="p-5 md:p-6">
              {!selected ? (
                <EmptyState text={t("ai.checklist.empty")} />
              ) : (
                <>
                  <div className="mb-4">
                    <Label className="block text-sm font-medium">{t("ai.translate.title")}</Label>
                    <p className="mt-1 text-xs text-muted-foreground">{t("ai.translate.subtitle")}</p>
                  </div>

                  <div className="mb-4 flex flex-wrap items-center gap-2 rounded-md border border-ochre/30 bg-ochre/8 p-3 text-xs">
                    <Languages className="h-4 w-4 text-ochre" />
                    <span>
                      ES → {LANG_NAMES[selected.language] ?? selected.language}
                    </span>
                    <span className="text-muted-foreground">
                      · {selected.convocatoriaName}
                    </span>
                  </div>

                  {!translation && !translating && (
                    <Button onClick={() => translate()} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                      <Sparkles className="h-4 w-4" />
                      {t("ai.translate.button")}
                    </Button>
                  )}

                  {translating && (
                    <CenterLoader text={t("ai.translate.processing")} />
                  )}

                  {translation && !translating && (
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Original (ES)
                        </div>
                        <pre className="max-h-96 overflow-y-auto rounded-lg border border-border bg-secondary/40 p-4 text-xs whitespace-pre-wrap scroll-warm">
                          {translation.original}
                        </pre>
                      </div>
                      <div>
                        <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          {LANG_NAMES[translation.target] ?? translation.target}
                        </div>
                        <pre className="max-h-96 overflow-y-auto rounded-lg border border-forest/30 bg-forest/5 p-4 text-xs whitespace-pre-wrap scroll-warm">
                          {translation.translated}
                        </pre>
                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-3 gap-1.5"
                          onClick={() => {
                            const blob = new Blob([translation.translated], { type: "text/plain" });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement("a");
                            a.href = url;
                            a.download = `documento-${translation.target}.txt`;
                            a.click();
                            URL.revokeObjectURL(url);
                          }}
                        >
                          <Download className="h-3.5 w-3.5" />
                          {t("ai.translate.download")}
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="mt-5 flex justify-end">
                    <Button onClick={() => setActiveTab("pitch")} variant="outline" className="gap-1.5">
                      {t("ai.tab.pitch")}
                    </Button>
                  </div>
                </>
              )}
            </TabsContent>

            {/* PITCH */}
            <TabsContent value="pitch" className="p-5 md:p-6">
              {!selected ? (
                <EmptyState text={t("ai.checklist.empty")} />
              ) : (
                <>
                  <div className="mb-4">
                    <Label className="block text-sm font-medium">{t("ai.pitch.title")}</Label>
                    <p className="mt-1 text-xs text-muted-foreground">{t("ai.pitch.subtitle")}</p>
                  </div>

                  {!pitch && !pitching && (
                    <Button onClick={generatePitch} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                      <Wand2 className="h-4 w-4" />
                      {t("ai.pitch.button")}
                    </Button>
                  )}

                  {pitching && <CenterLoader text={t("ai.pitch.processing")} />}

                  {pitch && !pitching && (
                    <>
                      <div className="mb-3 flex flex-wrap gap-2">
                        <Button size="sm" variant="outline" onClick={copyPitch} className="gap-1.5">
                          <Copy className="h-3.5 w-3.5" />
                          {t("ai.pitch.copy")}
                        </Button>
                        <Button size="sm" variant="outline" onClick={downloadPitch} className="gap-1.5">
                          <Download className="h-3.5 w-3.5" />
                          {t("ai.pitch.export")}
                        </Button>
                        <Button size="sm" variant="outline" onClick={generatePitch} className="gap-1.5">
                          <Sparkles className="h-3.5 w-3.5" />
                          Regenerar
                        </Button>
                      </div>
                      <pre className="max-h-[600px] overflow-y-auto rounded-lg border border-border bg-secondary/40 p-4 text-xs whitespace-pre-wrap scroll-warm font-mono">
                        {pitch}
                      </pre>
                    </>
                  )}

                  <div className="mt-5 flex justify-end">
                    <Button onClick={() => setActiveTab("apply")} variant="outline" className="gap-1.5">
                      {t("ai.tab.apply")}
                    </Button>
                  </div>
                </>
              )}
            </TabsContent>

            {/* APPLY */}
            <TabsContent value="apply" className="p-5 md:p-6">
              {!selected ? (
                <EmptyState text={t("ai.checklist.empty")} />
              ) : applied ? (
                <div className="flex flex-col items-center py-8 text-center">
                  <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-forest/15">
                    <CheckCircle2 className="h-8 w-8 text-forest" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-foreground">
                    {t("ai.apply.done")}
                  </h3>
                  <p className="mt-2 max-w-md text-sm text-muted-foreground">
                    {selected.convocatoriaName} · {selected.funder}
                  </p>
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <Label className="block text-sm font-medium">{t("ai.apply.title")}</Label>
                    <p className="mt-1 text-xs text-muted-foreground">{t("ai.apply.subtitle")}</p>
                  </div>

                  <div className="space-y-3">
                    <SummaryRow label="Convocatoria" value={selected.convocatoriaName} />
                    <SummaryRow label="Financiador" value={selected.funder} />
                    <SummaryRow label="País" value={selected.country} />
                    <SummaryRow label="Idioma" value={LANG_NAMES[selected.language] ?? selected.language} />
                    <SummaryRow
                      label="Monto solicitado"
                      value={formatMoney(selected.maxAmount, selected.currency)}
                    />
                    <SummaryRow label="Cierre" value={selected.deadline} />
                    <SummaryRow
                      label="Documentos listos"
                      value={`${haveCount}/${haveCount + missingCount}`}
                    />
                    <SummaryRow label="Pitch" value={pitch ? "Generado ✓" : "Pendiente"} />
                  </div>

                  <Separator className="my-5" />

                  <div className="flex items-start gap-2 rounded-md border border-ochre/30 bg-ochre/8 p-3 text-xs">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-ochre" />
                    <span className="text-muted-foreground">{t("ai.disclaimer")}</span>
                  </div>

                  <Button
                    onClick={apply}
                    disabled={applying}
                    className="mt-5 w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90 sm:w-auto"
                  >
                    {applying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    {applying ? t("ai.apply.processing") : t("ai.apply.button")}
                  </Button>
                </>
              )}
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </section>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <FileText className="mb-3 h-10 w-10 text-muted-foreground/60" />
      <p className="max-w-sm text-sm text-muted-foreground">{text}</p>
    </div>
  );
}

function CenterLoader({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader2 className="mb-3 h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border/60 pb-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}
