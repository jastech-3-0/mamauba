"use client";

import React, { useEffect, useState } from "react";
import { Navbar } from "@/components/mamauba/navbar";
import { Hero } from "@/components/mamauba/hero";
import { About } from "@/components/mamauba/about";
import { Projects } from "@/components/mamauba/projects";
import { AiPanel } from "@/components/mamauba/ai-panel";
import { Transparency } from "@/components/mamauba/transparency";
import { Footer } from "@/components/mamauba/footer";
import { DonateModal } from "@/components/mamauba/donate-modal";

type Campaign = {
  id: string;
  slug: string;
  title: string;
  titleEn: string;
  titlePt: string;
};

export default function Home() {
  const [donateOpen, setDonateOpen] = useState(false);
  const [initialCampaign, setInitialCampaign] = useState<string | undefined>(undefined);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  useEffect(() => {
    fetch("/api/convocatorias/campaigns")
      .then((r) => r.json())
      .then((d) => setCampaigns(d.campaigns ?? []))
      .catch(() => {});
  }, []);

  const openDonate = (campaignId?: string) => {
    setInitialCampaign(campaignId);
    setDonateOpen(true);
  };

  const goToAi = () => {
    document.getElementById("ai")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar onCta={() => openDonate()} />

      <main className="flex-1">
        <Hero onDonate={() => openDonate()} onExploreAi={goToAi} />
        <About />
        <Projects onDonate={openDonate} />
        <AiPanel />
        <Transparency />
      </main>

      <Footer />

      <DonateModal
        open={donateOpen}
        onClose={() => setDonateOpen(false)}
        initialCampaignId={initialCampaign}
        campaigns={campaigns}
      />
    </div>
  );
}
