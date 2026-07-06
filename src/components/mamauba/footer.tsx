"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Mail,
  Phone,
  MapPin,
  FileText,
  Linkedin,
  Instagram,
  Facebook,
  Globe,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";
import { MAMAUBA_INFO } from "@/lib/mamauba-data";

export function Footer() {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const subscribe = async () => {
    if (!email) return;
    try {
      await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
    } catch {
      /* noop */
    }
    setSent(true);
    setEmail("");
    setTimeout(() => setSent(false), 4000);
  };

  const docs = [
    { key: "footer.docs.cert", href: "#" },
    { key: "footer.docs.rut", href: "#" },
    { key: "footer.docs.estatutos", href: "#" },
    { key: "footer.docs.asamblea", href: "#" },
  ];

  return (
    <footer id="contact" className="bg-foreground text-background">
      <div className="mx-auto max-w-7xl px-4 py-14 md:px-8">
        <div className="grid gap-10 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2">
              <span className="font-display text-2xl font-bold">{MAMAUBA_INFO.name}</span>
            </div>
            <p className="mt-3 max-w-md text-sm text-background/70">
              {t("footer.mission")}
            </p>

            <div className="mt-5 space-y-1.5 text-sm text-background/80">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-ochre" />
                <span>
                  {MAMAUBA_INFO.address}, {MAMAUBA_INFO.city}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-ochre" />
                <span>{MAMAUBA_INFO.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-ochre" />
                <a
                  href={`mailto:${MAMAUBA_INFO.email}`}
                  className="hover:text-ochre"
                >
                  {MAMAUBA_INFO.email}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-ochre" />
                <span>
                  {t("brand.nit")} · {MAMAUBA_INFO.legalPersonality}
                </span>
              </div>
            </div>

            <div className="mt-5 flex gap-2">
              {[Linkedin, Instagram, Facebook].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label="Social"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-background/20 text-background/70 transition-colors hover:bg-background/10 hover:text-background"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Legal docs */}
          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-background/60">
              {t("footer.legal")}
            </h4>
            <ul className="space-y-2 text-sm">
              {docs.map((d) => (
                <li key={d.key}>
                  <a
                    href={d.href}
                    className="text-background/80 transition-colors hover:text-ochre"
                  >
                    {t(d.key)}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-background/60">
              {t("footer.newsletter")}
            </h4>
            <p className="mb-3 text-xs text-background/60">
              Recibe alertas de convocatorias compatibles con Mamauba cada lunes.
            </p>
            {sent ? (
              <div className="flex items-center gap-2 rounded-md bg-forest/30 p-3 text-sm text-background">
                <CheckCircle2 className="h-4 w-4" />
                ¡Suscripción confirmada!
              </div>
            ) : (
              <div className="flex gap-2">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("footer.newsletter.placeholder")}
                  className="border-background/20 bg-background/10 text-background placeholder:text-background/40"
                />
                <Button
                  size="sm"
                  onClick={subscribe}
                  className="gap-1 bg-ochre text-foreground hover:bg-ochre/90"
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        <Separator className="my-8 bg-background/15" />

        <div className="flex flex-col items-start justify-between gap-3 text-xs text-background/50 md:flex-row md:items-center">
          <div>
            © {new Date().getFullYear()} {MAMAUBA_INFO.name}. {t("footer.rights")}
          </div>
          <div className="flex items-center gap-2">
            <Globe className="h-3.5 w-3.5" />
            <span>{t("footer.disclaimer")}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
