/**
 * Seed script — populates initial campaigns and convocatorias.
 */
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  console.log("Seeding campaigns…");

  const campaigns = [
    {
      slug: "ferreo-antioquia",
      title: "Rehabilitación ferroviaria Antioquia - Urabá",
      titleEn: "Railway rehabilitation Antioquia - Urabá",
      titlePt: "Reabilitação ferroviária Antioquia - Urabá",
      description:
        "Recuperación de 180 km de vía férrea para conectar la zona bananera de Urabá con el puerto de Turbo, reduciendo costos logísticos en 35% y generando 1.200 empleos directos en comunidades afrodescendientes.",
      descEn:
        "Recovery of 180 km of railway connecting the banana region of Urabá with the port of Turbo, reducing logistics costs by 35% and generating 1,200 direct jobs in afro-descendant communities.",
      descPt:
        "Recuperação de 180 km de via férrea conectando a região bananeira de Urabá com o porto de Turbo, reduzindo custos logísticos em 35% e gerando 1.200 empregos diretos em comunidades afrodescendentes.",
      category: "ferreo",
      goal: 4_500_000,
      raised: 1_275_000,
      backers: 312,
      cover: "/img/proj-ferreo.svg",
    },
    {
      slug: "seguridad-alimentaria-cauca",
      title: "Seguridad alimentaria resguardo indígena Cauca",
      titleEn: "Food security Cauca indigenous reserve",
      titlePt: "Segurança alimentar resguardo indígena Cauca",
      description:
        "Instalación de 240 huertas comunitarias y un centro de acopio para 8 cabildos misak del Cauca, garantizando soberanía alimentaria a 3.500 familias y comercialización excedentaria.",
      descEn:
        "Installation of 240 community gardens and a collection center for 8 Misak councils of Cauca, ensuring food sovereignty for 3,500 families and surplus commercialization.",
      descPt:
        "Instalação de 240 hortas comunitárias e um centro de coleta para 8 conselhos Misak do Cauca, garantindo soberania alimentar para 3.500 famílias e comercialização excedente.",
      category: "agro",
      goal: 880_000,
      raised: 412_300,
      backers: 187,
      cover: "/img/proj-agro.svg",
    },
    {
      slug: "educacion-infantil-envigado",
      title: "Casa de la primera infancia Envigado",
      titleEn: "Early childhood house Envigado",
      titlePt: "Casa da primeira infância Envigado",
      description:
        "Construcción de un centro de atención integral para 320 niños y niñas de estratos 1 y 2 de Envigado, con enfoque diferencial para hijos de comunidad LGBTIQ+ víctimas de desplazamiento.",
      descEn:
        "Construction of a comprehensive care center for 320 children from strata 1 and 2 of Envigado, with differential approach for children of LGBTIQ+ community victims of displacement.",
      descPt:
        "Construção de um centro de atenção integral para 320 crianças dos estratos 1 e 2 de Envigado, com abordagem diferencial para filhos da comunidade LGBTIQ+ vítimas de deslocamento.",
      category: "educacion",
      goal: 650_000,
      raised: 198_400,
      backers: 96,
      cover: "/img/proj-educ.svg",
    },
    {
      slug: "cultura-afro-pacifico",
      title: "Laboratorio cultural Pacífico afrocolombiano",
      titleEn: "Afro-Colombian Pacific cultural lab",
      titlePt: "Laboratório cultural Pacífico afro-colombiano",
      description:
        "Espacio de creación, archivo y circulación de música, danza y oralidad afropacífica en Buenaventura, Tumaco y Quibdó, con formación de 180 jóvenes creadores y un sello discográfico comunitario.",
      descEn:
        "Space for creation, archive and circulation of Afro-Pacific music, dance and oral tradition in Buenaventura, Tumaco and Quibdó, training 180 young creators and a community record label.",
      descPt:
        "Espaço de criação, arquivo e circulação de música, dança e oralidade afropacífica em Buenaventura, Tumaco e Quibdó, formação de 180 jovens criadores e um selo discográfico comunitário.",
      category: "cultura",
      goal: 540_000,
      raised: 156_700,
      backers: 73,
      cover: "/img/proj-cult.svg",
    },
    {
      slug: "salud-comunitaria-choco",
      title: "Postas de salud comunitaria Chocó",
      titleEn: "Community health posts Chocó",
      titlePt: "Postos de saúde comunitária Chocó",
      description:
        "Equipamiento y dotación de 12 postas de salud rurales en el Bajo Atrato con telemedicina, atención maternal y provisión de medicamentos esenciales para 18.000 habitantes.",
      descEn:
        "Equipment and endowment of 12 rural health posts in the Lower Atrato with telemedicine, maternal care and provision of essential medicines for 18,000 inhabitants.",
      descPt:
        "Equipamento e dotação de 12 postos de saúde rurais no Baixo Atrato com telemedicina, atenção materna e provisão de medicamentos essenciais para 18.000 habitantes.",
      category: "salud",
      goal: 1_200_000,
      raised: 327_500,
      backers: 142,
      cover: "/img/proj-salud.svg",
    },
  ];

  for (const c of campaigns) {
    await db.campaign.upsert({
      where: { slug: c.slug },
      update: c,
      create: c,
    });
  }

  console.log("Seeding convocatorias sample…");

  const convocatorias = [
    {
      name: "USAID Colombia Inclusive Development",
      funder: "USAID",
      country: "Estados Unidos",
      language: "en",
      maxAmount: 2_500_000,
      currency: "USD",
      deadline: "2026-09-30",
      category: "cooperacion",
      eligibility: "ESAL constituida mínimo 1 año, con experiencia en comunidades vulnerables",
      url: "https://www.usaid.gov/colombia",
    },
    {
      name: " Unión Europea - Clima y Desarrollo Sostenible",
      funder: "Unión Europea",
      country: "Europa",
      language: "en",
      maxAmount: 1_800_000,
      currency: "EUR",
      deadline: "2026-11-15",
      category: "cooperacion",
      eligibility: "Organizaciones de América Latina con proyectos ambientales y de desarrollo sostenible",
      url: "https://europea.eu",
    },
    {
      name: "GIZ - Cooperación Alemana al Desarrollo",
      funder: "GIZ",
      country: "Alemania",
      language: "en",
      maxAmount: 950_000,
      currency: "EUR",
      deadline: "2026-10-20",
      category: "cooperacion",
      eligibility: "ESAL con proyectos de infraestructura sostenible o formación técnica",
      url: "https://www.giz.de",
    },
    {
      name: "Fundación Ford - Derechos y oportunidades",
      funder: "Ford Foundation",
      country: "Estados Unidos",
      language: "en",
      maxAmount: 600_000,
      currency: "USD",
      deadline: "2026-08-31",
      category: "filantropia",
      eligibility: "Organizaciones que trabajan con poblaciones LGBTIQ+, afros o indígenas",
      url: "https://www.fordfoundation.org",
    },
    {
      name: "BID Lab - Innovación social Latam",
      funder: "BID Lab",
      country: "Estados Unidos",
      language: "es",
      maxAmount: 750_000,
      currency: "USD",
      deadline: "2026-12-10",
      category: "multilateral",
      eligibility: "ESAL de América Latina con innovaciones escalables en desarrollo social",
      url: "https://bidlab.org",
    },
    {
      name: "Ministerio de Cultura - Estímulos Colombia",
      funder: "Ministerio de Cultura",
      country: "Colombia",
      language: "es",
      maxAmount: 80_000,
      currency: "USD",
      deadline: "2026-09-15",
      category: "nacional",
      eligibility: "Personas jurídicas sin ánimo de lucro colombianas con proyectos culturales",
      url: "https://www.mincultura.gov.co",
    },
    {
      name: "FCPD - Fondo Canadá para Proyectos Democráticos",
      funder: "Global Affairs Canada",
      country: "Canadá",
      language: "en",
      maxAmount: 1_200_000,
      currency: "CAD",
      deadline: "2026-10-05",
      category: "cooperacion",
      eligibility: "ESAL con proyectos de inclusión social y derechos humanos en Latam",
      url: "https://www.international.gc.ca",
    },
    {
      name: "Open Society Foundations",
      funder: "Open Society",
      country: "Estados Unidos",
      language: "en",
      maxAmount: 1_500_000,
      currency: "USD",
      deadline: "2026-11-30",
      category: "filantropia",
      eligibility: "Organizaciones con trabajo en derechos de poblaciones vulnerables y justicia",
      url: "https://www.opensocietyfoundations.org",
    },
  ];

  for (const c of convocatorias) {
    const existing = await db.convocatoria.findFirst({
      where: { name: c.name },
    });
    if (!existing) {
      await db.convocatoria.create({ data: c });
    }
  }

  console.log("Seeding movements (transparency)…");
  const movements = [
    { type: "in", amount: 250_000, currency: "USD", concept: "Donación corporativa - Bancolombia" },
    { type: "in", amount: 48_300, currency: "USD", concept: "Crowdfunding 187 donantes individuales" },
    { type: "in", amount: 320_000, currency: "USD", concept: "Cooperación GIZ - vía férrea" },
    { type: "out", amount: 145_000, currency: "USD", concept: "Compra de rieles y balasto Antioquia" },
    { type: "out", amount: 78_500, currency: "USD", concept: "Materiales huertas comunitarias Cauca" },
    { type: "out", amount: 22_000, currency: "USD", concept: "Honorarios equipo educativo Envigado" },
    { type: "in", amount: 65_000, currency: "USD", concept: "Donación recurrente mensual" },
    { type: "out", amount: 38_000, currency: "USD", concept: "Dotación postas salud Chocó" },
  ];
  for (const m of movements) {
    await db.movement.create({ data: m });
  }

  console.log("Seed completed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
