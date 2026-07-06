import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { llmChat } from "@/lib/zai";
import { MAMAUBA_INFO } from "@/lib/mamauba-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

type Body = {
  convocatoriaId?: string;
  sourceLanguage?: string;
  targetLanguage?: string;
  documentSlug?: string;
  documentName?: string;
  documentContent?: string;
};

const LANGUAGE_NAMES: Record<string, string> = {
  es: "español",
  en: "English",
  pt: "português",
  fr: "français",
  de: "Deutsch",
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Body;

    let targetLanguage = body.targetLanguage ?? "en";
    if (body.convocatoriaId) {
      const conv = await db.convocatoria.findUnique({
        where: { id: body.convocatoriaId },
      });
      if (conv) targetLanguage = conv.language;
    }

    const sourceLanguage = body.sourceLanguage ?? "es";
    const documentContent =
      body.documentContent?.trim() ||
      buildDefaultDocument(body.documentSlug ?? body.documentName ?? "", body.targetLanguage ?? targetLanguage);

    const systemPrompt = `Eres un traductor jurado especializado en documentos de cooperación internacional y proyectos de ESAL. Traduces del ${LANGUAGE_NAMES[sourceLanguage] ?? sourceLanguage} al ${LANGUAGE_NAMES[targetLanguage] ?? targetLanguage} preservando:
- La terminología jurídica y tributaria propia de ESAL colombianas (RUT, personería jurídica, ESAL, DIAN, etc.).
- La fidelidad de cifras, fechas, NIT y nombres propios.
- El tono formal y ejecutivo.

Devuelves ÚNICAMENTE el texto traducido, sin introducciones, sin notas, sin markdown extra.`;

    const userPrompt = `Contexto de la organización emisora:
${MAMAUBA_INFO.name} — NIT ${MAMAUBA_INFO.nit}, ${MAMAUBA_INFO.type}, ${MAMAUBA_INFO.city}.

Documento a traducir (idioma origen: ${LANGUAGE_NAMES[sourceLanguage] ?? sourceLanguage}):

"""
${documentContent}
"""

Traduce al ${LANGUAGE_NAMES[targetLanguage] ?? targetLanguage}.`;

    let translated: string;
    try {
      translated = await llmChat(systemPrompt, userPrompt);
    } catch (err) {
      console.error("[translate-docs] LLM failed", err);
      // Fallback: prepend a notice and return original.
      translated =
        `[Traducción no disponible en este momento — mostrando contenido original en ${LANGUAGE_NAMES[sourceLanguage] ?? sourceLanguage}.]\n\n` +
        documentContent;
    }

    return NextResponse.json({
      sourceLanguage,
      targetLanguage,
      original: documentContent,
      translated,
    });
  } catch (e) {
    console.error("[translate-docs]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

function buildDefaultDocument(slug: string, _target: string): string {
  // Provide pre-baked content for known Mamauba docs so the demo "just works"
  // even when the user doesn't paste their own text.
  const map: Record<string, string> = {
    "cert-camara": `CERTIFICADO DE EXISTENCIA Y REPRESENTACIÓN LEGAL

La Cámara de Comercio Aburrá Sur certifica que CORPORACIÓN MAMAUBA, identificada con NIT 901.662.513-5, domiciliada en Envigado (Antioquia), se encuentra inscrita en el Libro I del Registro de Entidades sin Ánimo de Lucro bajo el número 14186, con personería jurídica 55.0000002409.12 otorgada el 12 de diciembre de 2022. Su término de duración es de 50 años.

Representante legal: Ubania Burbano Flórez, C.C. 34.526.729.
Suplente: Adriana Patricia Montoya Cuartas, C.C. 1.037.577.450.

Entidad de vigilancia y control: Gobernación de Antioquia.`,
    rut: `REGISTRO ÚNICO TRIBUTARIO (RUT)

Razón social: CORPORACIÓN MAMAUBA
NIT: 901.662.513 - DV 5
Tipo de contribuyente: Persona jurídica
Actividad económica principal: CIIU 9499
Departamento: Antioquia - Municipio: Envigado
Dirección: CR 40 A 40 F SUR 51 IN 103
Correo: corpomamauba@gmail.com - Teléfono: 3016906973

Responsabilidades: Impuesto de renta y complementarios (régimen ordinario); Retención en la fuente a título de renta; Informante de exógena; Obligado a llevar contabilidad; Informante de Beneficiarios Finales.`,
    estatutos: `ESTATUTOS DE LA CORPORACIÓN MAMAUBA

Artículo 1. La entidad se denomina CORPORACIÓN MAMAUBA.
Artículo 2. Domicilio: Envigado, Antioquia.
Artículo 3. Objeto general: promover y trabajar por el desarrollo social integral sostenible de los campesinos, indígenas, afros y LGBTIQ+ de Colombia, buscando la ayuda de los demás países del mundo.
Artículo 5. Patrimonio inicial: $1.000.000 COP, conformado por aportes de socios fundadores, donaciones y prestación de servicios.
Artículo 6. Duración: 50 años contados a partir del registro en la Cámara de Comercio.`,
    "acta-constitucion": `ACTA DE CONSTITUCIÓN

En Envigado, Antioquia, el 26 de octubre de 2022, a las 14:00 horas, se reunieron los socios fundadores de la CORPORACIÓN MAMAUBA con el fin de constituir la corporación sin ánimo de lucro, aprobar estatutos y designar órganos de dirección.

Presidente: Ubania Burbano Flórez.
Secretaria: Leidy Juliet Robledo.

Orden del día:
1. Designación de Director Ejecutivo y Secretario de Asamblea.
2. Constitución de la Corporación.
3. Aprobación de Estatutos.
4. Aprobación del acta.

El acta fue aprobada por unanimidad a las 19:00 horas.`,
    "proyecto-ejecutivo": `RESUMEN EJECUTIVO DEL PROYECTO

Corporación Mamauba presenta el proyecto "Rehabilitación ferroviaria Antioquia - Urabá" con el objetivo de recuperar 180 km de vía férrea conectando la zona bananera de Urabá con el puerto de Turbo. El proyecto generará 1.200 empleos directos en comunidades afrodescendientes, reducirá los costos logísticos en 35% y permitirá la salida de 4,5 millones de cajas de banano al año.

Presupuesto total: USD 4.500.000.
Plazo de ejecución: 24 meses.
Contrapartida: USD 600.000 en especie.

Población beneficiaria: 18.000 habitantes del Bajo Cauca y Urabá antioqueño.`,
    "carta-compromiso": `CARTA DE COMPROMISO

Envigado, Colombia.

La suscrita Ubania Burbano Flórez, identificada con C.C. 34.526.729, en mi calidad de Directora Ejecutiva de la CORPORACIÓN MAMAUBA (NIT 901.662.513-5), manifiesto el compromiso institucional de la entidad con la ejecución del proyecto presentado, así como la disponibilidad de contrapartida y la voluntad de cumplir con todos los requisitos exigidos por el financiador.

Atentamente,

Ubania Burbano Flórez
Directora Ejecutiva
Corporación Mamauba`,
  };

  return (
    map[slug] ||
    `Documento a traducir. Pega aquí el contenido del documento en español para que la IA lo traduzca al idioma oficial de la convocatoria seleccionada.`
  );
}
