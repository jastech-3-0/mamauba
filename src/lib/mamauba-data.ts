/**
 * Static data about Corporación Mamauba extracted from the uploaded
 * legal documents (Cámara de Comercio Aburrá Sur certificate + bylaws + RUT).
 */

export type TeamMember = {
  role: string;
  name: string;
  id: string;
  city: string;
  email?: string;
  phone?: string;
};

export const MAMAUBA_INFO = {
  name: "Corporación MAMAUBA",
  nit: "901.662.513-5",
  city: "Envigado, Antioquia, Colombia",
  address: "Cra 40A # 40F sur-51, interior 103, edificio Villamerced",
  phone: "+57 301 6906973",
  email: "corpomamauba@gmail.com",
  secondaryEmail: "ubaniabf@gmail.com",
  type: "Corporación sin ánimo de lucro (ESAL)",
  registration: "S0002409",
  registrationDate: "2022-12-12",
  legalPersonality: "55.0000002409.12",
  inspection: "Gobernación de Antioquia",
  duration: "50 años (2022 - 2072)",
  initialEquity: "COP $1.000.000",
  chamberOfCommerce: "Cámara de Comercio Aburrá Sur",
  book: "Libro I de Entidades sin Ánimo de Lucro, No. 14186",
  ciiu: "S9499",
  niifGroup: "Grupo III - Microempresas",
  taxResponsibilities: [
    "Impuesto de renta y complementarios (régimen ordinario)",
    "Retención en la fuente a título de renta",
    "Informante de exógena",
    "Obligado a llevar contabilidad",
    "Informante de Beneficiarios Finales",
  ],
};

export const TEAM: TeamMember[] = [
  {
    role: "director",
    name: "Ubania Burbano Flórez",
    id: "C.C. 34.526.729 (Popayán)",
    city: "Envigado, Antioquia",
    email: "ubaniaf@gmail.com",
    phone: "+57 301 6906973",
  },
  {
    role: "deputy",
    name: "Adriana Patricia Montoya Cuartas",
    id: "C.C. 1.037.577.450",
    city: "Envigado (Mirador de Ayurá El Salado)",
    email: "amcuartas11@hotmail.com",
    phone: "+57 320 887.5008",
  },
  {
    role: "secretary",
    name: "Leidy Juliet Robledo",
    id: "C.C. 43.185.312 (Itagüí)",
    city: "Envigado, Antioquia",
    email: "leidyrobledo@hotmail.com",
    phone: "+57 304 2937909",
  },
];

export const FOUNDERS = [
  { id: "4.611.382", name: "Julián Rodrigo Piamba Burbano", city: "Envigado" },
  { id: "10.290.386", name: "Alexander Piamba Burbano", city: "Envigado" },
  { id: "34.321.364", name: "Marta Isabel Piamba Burbano", city: "Envigado" },
  { id: "34.526.729", name: "Ubania Burbano Flórez", city: "Envigado" },
  { id: "10.534.619", name: "Ovidio Gentil Piamba Piamba", city: "Envigado" },
];

/**
 * Documents Mamauba already has on file (used by the AI checklist to mark
 * "already have" vs "missing").
 */
export const MAMAUBA_EXISTING_DOCS = [
  { slug: "cert-camara", name: "Certificado de Existencia y Representación Legal", language: "es" },
  { slug: "rut", name: "RUT - Registro Único Tributario", language: "es" },
  { slug: "estatutos", name: "Estatutos vigentes", language: "es" },
  { slug: "acta-constitucion", name: "Acta de constitución (26 oct 2022)", language: "es" },
  { slug: "acta-asamblea", name: "Acta de asamblea general", language: "es" },
  { slug: "balance-2023", name: "Estados financieros 2023", language: "es" },
];
