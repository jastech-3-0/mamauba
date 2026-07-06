import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { llmJson } from "@/lib/zai";
import { MAMAUBA_INFO } from "@/lib/mamauba-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type MatchResult = {
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
  score: number; // 0-100
  rationale: string;
};

/**
 * 1. Pulls the convocatoria catalog from DB (real seed of real funders:
 *    USAID, UE, GIZ, Ford, BID Lab, MinCultura, Canada, Open Society).
 * 2. Sends the user's query + Mamauba's profile + the catalog to the LLM and
 *    asks it to return strict JSON with the top compatible calls + an
 *    eligibility score and rationale for each.
 * 3. Returns the ranked list.
 */
export async function POST(req: NextRequest) {
  try {
    const { query } = (await req.json()) as { query?: string };

    const catalog = await db.convocatoria.findMany({
      orderBy: { deadline: "asc" },
    });

    const profile = `
Corporación: ${MAMAUBA_INFO.name}
NIT: ${MAMAUBA_INFO.nit}
Tipo: ${MAMAUBA_INFO.type}
Domicilio: ${MAMAUBA_INFO.city}
Personería jurídica: ${MAMAUBA_INFO.legalPersonality} (12/dic/2022)
Vigilancia: ${MAMAUBA_INFO.inspection}
Patrimonio inicial: ${MAMAUBA_INFO.initialEquity}
Duración: ${MAMAUBA_INFO.duration}
CIIU: ${MAMAUBA_INFO.ciiu}
Objeto social: Desarrollo social integral sostenible de comunidades campesinas, indígenas, afros y LGBTIQ+ de Colombia, con transporte férreo, seguridad alimentaria, educación, cultura, ciencia y tecnología, salud y vivienda.
Poblaciones: campesinos, indígenas, afrodescendientes, LGBTIQ+.
Responsabilidades tributarias: ${MAMAUBA_INFO.taxResponsibilities.join("; ")}
`.trim();

    const catalogForLLM = catalog.map((c, i) => ({
      index: i,
      id: c.id,
      name: c.name,
      funder: c.funder,
      country: c.country,
      language: c.language,
      maxAmount: c.maxAmount,
      currency: c.currency,
      deadline: c.deadline,
      category: c.category,
      eligibility: c.eligibility,
      url: c.url,
    }));

    const systemPrompt = `Eres un motor de inteligencia artificial especializado en cooperación internacional, fundraising para ESAL (entidades sin ánimo de lucro) y ODS. Tu trabajo es recomendar las convocatorias más compatibles para una organización colombiana llamada Corporación Mamauba.

Devuelves SIEMPRE JSON estricto con esta forma:
{
  "matches": [
    {
      "convocatoriaId": "<id exacto del catálogo>",
      "score": <entero 0-100>,
      "rationale": "<máx 220 caracteres explicando por qué Mamauba encaja>"
    }
  ]
}

Reglas:
- Solo incluyes convocatorias cuyo score sea >= 50.
- Ordenas de mayor a menor score.
- El score refleja: alineación temática, elegibilidad jurídica, monto máximo vs necesidad, ventana de tiempo restante.
- Si la convocatoria exige idioma distinto al español, lo mencionas en rationale.
- No inventes convocatorias que no estén en el catálogo.
- No agregues texto fuera del JSON.`;

    const userPrompt = `Perfil de la organización:
${profile}

Necesidad expresada por el equipo de Mamauba:
"""
${query?.trim() || "Sin instrucción específica — recomendar las convocatorias con mejor fit general."}
"""

Catálogo de convocatorias (JSON):
${JSON.stringify(catalogForLLM, null, 2)}

Devuelve el JSON con las mejores recomendaciones.`;

    let matches: MatchResult[] = [];

    try {
      const llmResult = await llmJson<{ matches: { convocatoriaId: string; score: number; rationale: string }[] }>(
        systemPrompt,
        userPrompt,
      );
      const byId = new Map(catalog.map((c) => [c.id, c]));
      matches = (llmResult.matches ?? [])
        .filter((m) => byId.has(m.convocatoriaId))
        .map((m) => {
          const c = byId.get(m.convocatoriaId)!;
          return {
            convocatoriaId: c.id,
            convocatoriaName: c.name,
            funder: c.funder,
            country: c.country,
            language: c.language,
            maxAmount: c.maxAmount,
            currency: c.currency,
            deadline: c.deadline,
            category: c.category,
            eligibility: c.eligibility,
            url: c.url,
            score: Math.max(0, Math.min(100, Math.round(m.score))),
            rationale: m.rationale,
          };
        })
        .sort((a, b) => b.score - a.score);
    } catch (err) {
      console.error("[match-convocatorias] LLM failed, falling back to heuristic", err);
      // Heuristic fallback: score all catalog entries with a simple keyword overlap.
      const q = (query ?? "").toLowerCase();
      matches = catalog
        .map((c) => {
          const text = `${c.name} ${c.funder} ${c.category} ${c.eligibility}`.toLowerCase();
          let score = 55;
          if (q) {
            const tokens = q.split(/\s+/).filter((w) => w.length > 3);
            const hits = tokens.filter((tok) => text.includes(tok)).length;
            score = 50 + Math.min(40, hits * 8);
          }
          return {
            convocatoriaId: c.id,
            convocatoriaName: c.name,
            funder: c.funder,
            country: c.country,
            language: c.language,
            maxAmount: c.maxAmount,
            currency: c.currency,
            deadline: c.deadline,
            category: c.category,
            eligibility: c.eligibility,
            url: c.url,
            score,
            rationale:
              "Coincidencia heurística por palabras clave. Verifica requisitos manualmente.",
          };
        })
        .sort((a, b) => b.score - a.score);
    }

    return NextResponse.json({ matches });
  } catch (e) {
    console.error("[match-convocatorias]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
