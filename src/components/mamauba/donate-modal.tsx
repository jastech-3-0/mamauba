"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Shield,
  CheckCircle2,
  Loader2,
  Lock,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";
import { useToast } from "@/hooks/use-toast";

type Campaign = {
  id: string;
  slug: string;
  title: string;
  titleEn: string;
  titlePt: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  initialCampaignId?: string;
  campaigns: Campaign[];
};

const PRESETS_USD = [25, 50, 100, 250, 500, 1000];

export function DonateModal({ open, onClose, initialCampaignId, campaigns }: Props) {
  const { t, locale } = useI18n();
  const { toast } = useToast();

  const [amount, setAmount] = useState<number>(100);
  const [custom, setCustom] = useState<string>("");
  const [frequency, setFrequency] = useState<"once" | "monthly">("once");
  const [campaignId, setCampaignId] = useState<string>(initialCampaignId ?? "any");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("Colombia");
  const [taxCert, setTaxCert] = useState(true);
  const [status, setStatus] = useState<"idle" | "processing" | "success" | "error">("idle");

  useEffect(() => {
    if (open && initialCampaignId) {
      setCampaignId(initialCampaignId);
      setStatus("idle");
    }
    if (open) setStatus("idle");
  }, [open, initialCampaignId]);

  const finalAmount = custom ? Math.max(1, parseInt(custom, 10) || 0) : amount;

  const submit = async () => {
    if (!name || !email || finalAmount < 1) {
      toast({
        title: "Faltan datos",
        description: "Completa nombre, correo y un monto válido.",
        variant: "destructive",
      });
      return;
    }
    setStatus("processing");
    try {
      const res = await fetch("/api/donations/create-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: finalAmount,
          currency: "USD",
          frequency,
          campaignId: campaignId === "any" ? null : campaignId,
          donorName: name,
          donorEmail: email,
          donorCountry: country,
          taxCert,
        }),
      });
      if (!res.ok) throw new Error("Network");
      // Demo: we don't redirect to Stripe checkout here, just register + simulate.
      await new Promise((r) => setTimeout(r, 1200));
      setStatus("success");
    } catch (e) {
      setStatus("error");
    }
  };

  const campaignLabel = (c: Campaign) =>
    locale === "en" ? c.titleEn : locale === "pt" ? c.titlePt : c.title;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display text-2xl">
            <Sparkles className="h-5 w-5 text-terra" />
            {t("donate.title")}
          </DialogTitle>
          <DialogDescription>{t("donate.subtitle")}</DialogDescription>
        </DialogHeader>

        {status === "success" ? (
          <div className="flex flex-col items-center py-8 text-center">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-forest/15">
              <CheckCircle2 className="h-8 w-8 text-forest" />
            </div>
            <h3 className="font-display text-xl font-bold text-foreground">
              {t("donate.success.title")}
            </h3>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              {t("donate.success.body")}
            </p>
            <div className="mt-5 rounded-lg bg-secondary/60 px-4 py-2 text-sm">
              <span className="font-display font-bold text-terra-dark">
                ${finalAmount} USD
              </span>
              {frequency === "monthly" && (
                <span className="text-muted-foreground"> / {t("donate.frequency.monthly").toLowerCase()}</span>
              )}
            </div>
            <Button onClick={onClose} className="mt-6 bg-primary text-primary-foreground hover:bg-primary/90">
              {t("common.close")}
            </Button>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Amount */}
            <div>
              <Label className="mb-2 block text-sm font-medium">{t("donate.amount")}</Label>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                {PRESETS_USD.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => {
                      setAmount(p);
                      setCustom("");
                    }}
                    className={`rounded-md border px-2 py-2 text-sm font-semibold transition-colors ${
                      amount === p && !custom
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background hover:border-primary/50 hover:bg-secondary"
                    }`}
                  >
                    ${p}
                  </button>
                ))}
              </div>
              <div className="mt-2">
                <Label htmlFor="custom" className="mb-1 block text-xs text-muted-foreground">
                  {t("donate.amount.custom")} (USD)
                </Label>
                <Input
                  id="custom"
                  type="number"
                  min={1}
                  value={custom}
                  onChange={(e) => setCustom(e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>

            {/* Frequency */}
            <div>
              <Label className="mb-2 block text-sm font-medium">{t("donate.frequency")}</Label>
              <RadioGroup
                value={frequency}
                onValueChange={(v) => setFrequency(v as "once" | "monthly")}
                className="grid grid-cols-2 gap-2"
              >
                <Label
                  htmlFor="freq-once"
                  className={`cursor-pointer rounded-md border p-3 text-sm ${
                    frequency === "once"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-secondary"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem id="freq-once" value="once" />
                    <span className="font-medium">{t("donate.frequency.once")}</span>
                  </div>
                </Label>
                <Label
                  htmlFor="freq-monthly"
                  className={`cursor-pointer rounded-md border p-3 text-sm ${
                    frequency === "monthly"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-secondary"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem id="freq-monthly" value="monthly" />
                    <span className="font-medium">{t("donate.frequency.monthly")}</span>
                  </div>
                </Label>
              </RadioGroup>
            </div>

            {/* Project */}
            <div>
              <Label className="mb-2 block text-sm font-medium">{t("donate.project")}</Label>
              <Select value={campaignId} onValueChange={setCampaignId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">{t("donate.project.any")}</SelectItem>
                  {campaigns.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {campaignLabel(c)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Donor info */}
            <div>
              <Label className="mb-2 block text-sm font-medium">{t("donate.donor")}</Label>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label htmlFor="d-name" className="text-xs text-muted-foreground">
                    {t("donate.donor.name")}
                  </Label>
                  <Input id="d-name" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="d-email" className="text-xs text-muted-foreground">
                    {t("donate.donor.email")}
                  </Label>
                  <Input
                    id="d-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="d-country" className="text-xs text-muted-foreground">
                    {t("donate.donor.country")}
                  </Label>
                  <Input
                    id="d-country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                  />
                </div>
                <label className="flex items-end gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={taxCert}
                    onChange={(e) => setTaxCert(e.target.checked)}
                    className="h-4 w-4 rounded border-border accent-terra"
                  />
                  <span className="text-muted-foreground">{t("donate.donor.tax")}</span>
                </label>
              </div>
            </div>

            {/* Beta notice */}
            <div className="flex items-start gap-2 rounded-md border border-ochre/30 bg-ochre/8 p-3 text-xs">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-ochre" />
              <div>
                <div className="font-semibold text-foreground">{t("donate.beta.title")}</div>
                <div className="mt-0.5 text-muted-foreground">{t("donate.beta.body")}</div>
              </div>
            </div>

            <DialogFooter className="flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Shield className="h-3.5 w-3.5 text-forest" />
                {t("donate.secure")}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={onClose}>
                  {t("common.cancel")}
                </Button>
                <Button
                  onClick={submit}
                  disabled={status === "processing"}
                  className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {status === "processing" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Lock className="h-4 w-4" />
                  )}
                  {status === "processing"
                    ? t("donate.processing")
                    : `${t("donate.pay")} · $${finalAmount}`}
                </Button>
              </div>
            </DialogFooter>

            {status === "error" && (
              <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                {t("donate.error")}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
