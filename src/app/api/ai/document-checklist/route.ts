import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { llmJson } from "@/lib/zai";
import { MAMAUBA_INFO, MAMAUBA_EXISTING_DOCS } from "@/lib/mamauba-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ChecklistItem = {
  slug: string;
  name: string;
  required: boolean;
  language: "es" | "en" | "pt" | "fr" | "original";
  status: "have" | "missing";
  notes: string;
};

export async function POST(req: NextRequest) {
  try {
    const { convocatoriaId } = (await req.json()) as { convocatoriaId?: string };

    if (!convocatoriaId) {
      return NextResponse.json(
        { error: "convocatoriaId requerido" },
        { status: 400 },
      );
    }

    const conv = await db.convocatoria.findUnique({
      where: { id: convocatoriaId },
    });
    if (!conv) {
      return NextResponse.json(
        { error: "Convocatoria no encontrada" },
        { status: 404 },
      );
    }

    const profile = `
Organización: ${MAMAUBA_INFO.name}
NIT: ${MAMAUBA_INFO.nit}
Tipo: ${MAMAUBA_INFO.type}
Domicilio: ${MAMAUBA_INFO.city}
Personería jurídica: ${MAMAUBA_INFO.legalPersonality}
Vigilancia: ${MAMAUBA_INFO.inspection}
Patrimonio inicial: ${MAMAUBA_INFO.initialEquity}
CIIU: ${MAMAUBA_INFO.ciiu}
Documentos que Mamauba YA tiene en archivo:
${MAMAUBA_EXISTING_DOCS.map((d) => `- ${d.name} (en ${d.language})`).join("\n")}
`.trim();

    const convText = `
Convocatoria: ${conv.name}
Financiador: ${conv.funder}
País: ${conv.country}
Idioma oficial de la convocatoria: ${conv.language}
Monto máximo: ${conv.maxAmount} ${conv.currency}
Categoría: ${conv.category}
Cierre: ${conv.deadline}
Elegibilidad: ${conv.eligibility}
${conv.url ? "URL: " + conv.url : ""}
`.trim();

    const systemPrompt = `Eres un experto en formulación de proyectos de cooperación internacional para ESAL colombianas. Tu trabajo es listar EXACTAMENTE qué documentos necesita Corporación Mamauba para postularse a la convocatoria indicada, en qué idioma debe estar cada uno, y si Mamauba ya lo tiene o le falta.

Devuelves SIEMPRE JSON estricto con esta forma:
{
  "checklist": [
    {
      "slug": "identificador-kebab-case",
      "name": "Nombre humano del documento",
      "required": true|false,
      "language": "es" | "en" | "pt" | "fr" | "original",
      "status": "have" | "missing",
      "notes": "Indicación práctica de máximo 180 caracteres"
    }
  ]
}

Reglas:
- Lista entre 5 y 12 documentos.
- Marca "status": "have" SOLO si el documento ya existe en el archivo de Mamauba Y está en el idioma requerido (o "original"). Si existe en español pero la convocatoria pide inglés, status = "missing" y notes explica que hay que traducirlo.
- "language": "original" se usa cuando la convocatoria acepta el idioma nativo del donante sin restricción.
- Incluye siempre: identificación jurídica, RUT, estados financieros recientes, proyecto ejecutivo, presupuesto, cronograma, carta de compromiso, listado de beneficiarios.
- No agregues texto fuera del JSON.`;

    const userPrompt = `${profile}

${convText}

Genera el checklist completo.`;

    let checklist: ChecklistItem[] = [];

    try {
      const result = await llmJson<{ checklist: ChecklistItem[] }>(
        systemPrompt,
        userPrompt,
      );
      checklist = (result.checklist ?? []).map((item) => ({
        ...item,
        status:
          MAMAUBA_EXISTING_DOCS.some((d) => d.slug === item.slug) &&
          (item.language === "es" || item.language === "original")
            ? "have"
            : item.status,
      }));
    } catch (err) {
      console.error("[document-checklist] LLM failed, fallback", err);
      // Fallback: static checklist with simple language check.
      const requiredLang = conv.language as string;
      checklist = MAMAUBA_EXISTING_DOCS.map((d) => ({
        slug: d.slug,
        name: d.name,
        required: true,
        language: requiredLang as ChecklistItem["language"],
        status:
          requiredLang === "es" || requiredLang === d.language ? "have" : "missing",
        notes:
          requiredLang === "es"
            ? "Documento en archivo, listo para subir."
            : `Documento existente en español — traducir al idioma oficial de la convocatoria (${requiredLang}).`,
      }));
      // Add missing standard docs
      const extras: ChecklistItem[] = [
        {
          slug: "proyecto-ejecutivo",
          name: "Proyecto ejecutivo (narrativa + marco lógico)",
          required: true,
          language: requiredLang as ChecklistItem["language"],
          status: "missing",
          notes: "Documento central de la postulación. Generar con IA o redactar.",
        },
        {
          slug: "presupuesto",
          name: "Presupuesto detallado en moneda de la convocatoria",
          required: true,
          language: "original",
          status: "missing",
          notes: "Incluir contrapartida y desglose por rubro.",
        },
        {
          slug: "cronograma",
          name: "Cronograma de ejecución (Gantt)",
          required: true,
          language: "original",
          status: "missing",
          notes: "Mínimo 12 meses, con hitos verificables.",
        },
        {
          slug: "carta-compromiso",
          name: "Carta de compromiso de la entidad",
          required: true,
          language: requiredLang as ChecklistItem["language"],
          status: "missing",
          notes: "Firmada por Ubania Burbano Flórez, Directora Ejecutiva.",
        },
      ];
      checklist = [...checklist, ...extras];
    }

    return NextResponse.json({ convocatoria: conv, checklist });
  } catch (e) {
    console.error("[document-checklist]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
