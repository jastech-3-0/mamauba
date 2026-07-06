import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { llmChat } from "@/lib/zai";
import { MAMAUBA_INFO, TEAM, FOUNDERS } from "@/lib/mamauba-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 90;

type Body = {
  convocatoriaId?: string;
  query?: string;
  language?: string; // es | en | pt | ...
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Body;

    let conv = null;
    if (body.convocatoriaId) {
      conv = await db.convocatoria.findUnique({
        where: { id: body.convocatoriaId },
      });
    }

    const targetLang = body.language ?? conv?.language ?? "es";

    const profile = `
Organización: ${MAMAUBA_INFO.name}
NIT: ${MAMAUBA_INFO.nit}
Tipo: ${MAMAUBA_INFO.type}
Domicilio: ${MAMAUBA_INFO.city}
Personería jurídica: ${MAMAUBA_INFO.legalPersonality} (12/dic/2022)
Vigilancia: ${MAMAUBA_INFO.inspection}
Patrimonio inicial: ${MAMAUBA_INFO.initialEquity}
Duración: ${MAMAUBA_INFO.duration}
CIIU: ${MAMAUBA_INFO.ciiu}
Directora ejecutiva: ${TEAM.find((t) => t.role === "director")?.name}
Suplente: ${TEAM.find((t) => t.role === "deputy")?.name}
Secretaria: ${TEAM.find((t) => t.role === "secretary")?.name}
Socios fundadores: ${FOUNDERS.map((f) => f.name).join(", ")}
Objeto social: Desarrollo social integral sostenible de comunidades campesinas, indígenas, afros y LGBTIQ+ de Colombia, con énfasis en transporte férreo, seguridad alimentaria, educación, cultura, ciencia y tecnología, salud y vivienda.
Poblaciones prioritarias: campesinos, indígenas, afrodescendientes, LGBTIQ+.
Líneas estratégicas:
1. Transporte férreo de carga y pasajeros.
2. Seguridad alimentaria y agro.
3. Educación, cultura y deporte infantil.
4. Investigación, ciencia y tecnología.
5. Salud, vivienda y bienestar comunitario.
Responsabilidades tributarias: ${MAMAUBA_INFO.taxResponsibilities.join("; ")}
`.trim();

    const convBlock = conv
      ? `Convocatoria objetivo:
- Nombre: ${conv.name}
- Financiador: ${conv.funder}
- País: ${conv.country}
- Idioma oficial: ${conv.language}
- Monto máximo: ${conv.maxAmount} ${conv.currency}
- Cierre: ${conv.deadline}
- Categoría: ${conv.category}
- Elegibilidad: ${conv.eligibility}
${conv.url ? "- URL: " + conv.url : ""}
`
      : `Convocatoria objetivo: genérica para captación internacional de capital social.`;

    const langName: Record<string, string> = {
      es: "español",
      en: "English",
      pt: "português",
      fr: "français",
    };

    const systemPrompt = `Eres un estratega senior de fundraising y formulación de proyectos de cooperación internacional. Generas un pitch ejecutivo en formato Markdown para que Corporación Mamauba lo presente al financiador de la convocatoria.

El pitch DEBE tener esta estructura exacta con encabezados en nivel ##:

1. Resumen ejecutivo (3 párrafos cortos)
2. El problema (datos del contexto colombiano, comunidades objetivo)
3. Nuestra solución (cómo Mamauba aborda el problema)
4. Por qué Mamauba (trayectoria, equipo, marco legal)
5. Presupuesto solicitado (desglose por rubro en ${conv?.currency ?? "USD"})
6. Cronograma (12-24 meses, hitos)
7. Impacto esperado (indicadores cuantitativos)
8. Sostenibilidad (cómo continúa tras el financiamiento)
9. Solicitud (monto, plazo, contacto)

Reglas:
- Escribe TODO en ${langName[targetLang] ?? targetLang}.
- Tono formal, ejecutivo, persuasivo pero veraz.
- Cifras coherentes con el monto máximo de la convocatoria.
- Incluye siempre nombre de la organización y NIT al menos una vez.
- No inventes socios ni alianzas que no existan.
- Devuelve ÚNICAMENTE el pitch en Markdown, sin comentarios extras.`;

    const userPrompt = `${profile}

${convBlock}

Necesidad específica expresada por el equipo:
"""
${body.query?.trim() || "Apoyar la línea de mayor fit con la convocatoria seleccionada."}
"""

Genera el pitch completo en ${langName[targetLang] ?? targetLang}.`;

    let pitch: string;
    try {
      pitch = await llmChat(systemPrompt, userPrompt);
    } catch (err) {
      console.error("[generate-pitch] LLM failed", err);
      pitch = buildFallbackPitch(profile, conv, body.query ?? "", targetLang);
    }

    // Persist the pitch
    if (conv) {
      await db.application.upsert({
        where: { id: `draft-${conv.id}` },
        update: {
          convocatoriaId: conv.id,
          pitchMd: pitch,
          status: "draft",
        },
        create: {
          id: `draft-${conv.id}`,
          convocatoriaId: conv.id,
          pitchMd: pitch,
          status: "draft",
        },
      });
    }

    return NextResponse.json({
      convocatoria: conv,
      language: targetLang,
      pitch,
    });
  } catch (e) {
    console.error("[generate-pitch]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

function buildFallbackPitch(
  profile: string,
  conv: { name: string; maxAmount: number; currency: string } | null,
  query: string,
  lang: string,
): string {
  return `## Resumen ejecutivo

Corporación Mamauba (NIT 901.662.513-5) es una ESAL colombiana constituida en 2022 que promueve el desarrollo social integral sostenible de comunidades campesinas, indígenas, afros y LGBTIQ+.

Solicita a ${conv?.name ?? "el financiador"} un apoyo de ${conv?.maxAmount.toLocaleString() ?? ""} ${conv?.currency ?? "USD"} para ejecutar un proyecto alineado con su objeto social y la convocatoria.

El proyecto generará impacto medible en comunidades vulnerables del territorio colombiano.

## El problema

Las comunidades campesinas, indígenas, afrodescendientes y LGBTIQ+ de Colombia enfrentan barreras estructurales de acceso a educación, salud, infraestructura y oportunidades económicas.

## Nuestra solución

Mamauba articula capital nacional e internacional con proyectos territoriales de alto impacto en cinco líneas estratégicas.

## Por qué Mamauba

Marco jurídico sólido, personería jurídica vigente, equipo directivo comprometido y experiencia comprobada en desarrollo territorial.

## Presupuesto solicitado

Total: ${conv?.maxAmount.toLocaleString() ?? ""} ${conv?.currency ?? "USD"}

## Cronograma

24 meses con hitos trimestrales verificables.

## Impacto esperado

- 1.200 empleos directos
- 18.000 beneficiarios indirectos
- 5 comunidades impactadas

## Sostenibilidad

Modelo de ingreso mixto con donaciones, cooperación internacional y excedentes de proyectos productivos.

## Solicitud

Solicitamos ${conv?.maxAmount.toLocaleString() ?? ""} ${conv?.currency ?? "USD"} a ${conv?.name ?? "el financiador"}.

Contacto: Ubania Burbano Flórez, Directora Ejecutiva — ubaniaf@gmail.com — +57 301 6906973.

(Nota: pitch generado en modo fallback. Activa el LLM para una versión completa.)`;
}
