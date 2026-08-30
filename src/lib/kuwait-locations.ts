/**
 * Official Kuwait governorate / area master for DocAlert branch location fields.
 *
 * Sources (static snapshot; no runtime API):
 * 1. Public Authority for Civil Information (PACI) area names, published as the
 *    source of Central Statistical Bureau Census Table 51
 *    ("Total population by habitual residence status (Area)"),
 *    https://census.csb.gov.kw/CensusData?st_id=71&handler=ExportExcel
 *    Footer of that workbook: "Source: The Public Authority For Civil Information".
 * 2. Six governorates confirmed by Kuwait Government Online:
 *    Al Asimah (Capital), Hawalli, Al Farwaniya, Al Ahmadi,
 *    Mubarak Al-Kabeer, Al Jahra.
 *
 * Governorate assignment:
 * CSB/PACI Table 51 does not include a governorate column. Areas are listed in
 * contiguous official PACI geographic blocks. This file maps each block to the
 * corresponding governorate using those official sequence boundaries
 * (Capital → Hawalli → Ahmadi → Jahra → Farwaniya → Mubarak Al-Kabeer).
 *
 * Display names are cleaned English labels. `sourceName` preserves the PACI/CSB
 * English cell value for traceability.
 *
 * Ambiguous mappings documented in kuwait-locations.test.ts.
 */
export type KuwaitArea = {
  id: string;
  name: string;
  sourceName: string;
};

export type KuwaitGovernorate = {
  id: string;
  name: string;
  areas: KuwaitArea[];
};

export const KUWAIT_GOVERNORATES: KuwaitGovernorate[] = [
  {
    id: "capital",
    name: "Capital",
    areas: [
      { id: "dasman", name: "Dasman", sourceName: "DASMAN" },
      { id: "sharq", name: "Sharq", sourceName: "AL-SHARQ" },
      { id: "mirqab", name: "Mirqab", sourceName: "AL-MURGAB" },
      { id: "soor-parks", name: "Soor Parks", sourceName: "AL-SOOR PARKS" },
      { id: "qibla", name: "Qibla", sourceName: "AL-QIBLA" },
      { id: "bnaid-al-qar", name: "Bnaid Al-Qar", sourceName: "BNIED AL-GAR" },
      { id: "dasma", name: "Dasma", sourceName: "AL-DASMA" },
      { id: "mansouriya", name: "Mansouriya", sourceName: "AL-MANSOURIA" },
      { id: "abdullah-al-salem", name: "Abdullah Al-Salem", sourceName: "ABDULLAH AL-SALEM" },
      { id: "shamiya", name: "Shamiya", sourceName: "AL-SHAMIYA" },
      { id: "daiya", name: "Daiya", sourceName: "AL-DAIYA" },
      { id: "qadsiya", name: "Qadsiya", sourceName: "AL-QADISIYA" },
      { id: "nuzha", name: "Nuzha", sourceName: "AL-NUZHA" },
      { id: "faiha", name: "Faiha", sourceName: "AL-FAIHA" },
      { id: "kaifan", name: "Kaifan", sourceName: "KAIFAN" },
      { id: "rawda", name: "Rawda", sourceName: "AL-RAWDA" },
      { id: "adailiya", name: "Adailiya", sourceName: "AL-ADAILIYA" },
      { id: "khaldiya", name: "Khaldiya", sourceName: "AL-KHALIDIYA" },
      { id: "surra", name: "Surra", sourceName: "AL-SURA" },
      { id: "qortuba", name: "Qortuba", sourceName: "QURTOBA" },
      { id: "yarmouk", name: "Yarmouk", sourceName: "AL-YARMOUK" },
      { id: "shuwaikh", name: "Shuwaikh", sourceName: "AL-SHUWAIKH" },
      { id: "shuwaikh-industrial", name: "Shuwaikh Industrial", sourceName: "AL-SHUWAIKH INDUSTRIAL" },
      { id: "granada", name: "Granada", sourceName: "GARNATA" },
      { id: "mubarakiya-camps", name: "Mubarakiya Camps", sourceName: "AL-MUBARAKIYA CAMPS" },
      { id: "shuwaikh-medical", name: "Shuwaikh Medical", sourceName: "AL-SHUWAIKH MEDICAL" },
      { id: "sulaibikhat", name: "Sulaibikhat", sourceName: "AL-SULAIBIKHAT" },
      { id: "doha", name: "Doha", sourceName: "AL-DOHA RESIDENTIAL" },
      { id: "doha-port", name: "Doha Port", sourceName: "AL-DOHA PORT" },
      { id: "failaka-island", name: "Failaka Island", sourceName: "FAILAKA ISLAND" },
      { id: "doha-chalets", name: "Doha Chalets", sourceName: "AL-DOHA CHALETS" },
      { id: "north-west-sulaibikhat", name: "North West Sulaibikhat", sourceName: "NORTH WEST SULIBIKHAT" },
      { id: "jaber-al-ahmad-city", name: "Jaber Al-Ahmad City", sourceName: "JABER AL-AHMED CITY" },
    ],
  },
  {
    id: "hawalli",
    name: "Hawalli",
    areas: [
      { id: "hawalli", name: "Hawalli", sourceName: "HAWALLI" },
      { id: "salmiya", name: "Salmiya", sourceName: "AL-SALMIYA" },
      { id: "shaab", name: "Shaab", sourceName: "ALSHAAB" },
      { id: "rumaithiya", name: "Rumaithiya", sourceName: "AL-RUMAITHIYA" },
      { id: "salwa", name: "Salwa", sourceName: "SALWA" },
      { id: "bidaa", name: "Bidaa", sourceName: "AL-BIDA" },
      { id: "mishref", name: "Mishref", sourceName: "MISHRIEF" },
      { id: "mubarak-al-abdullah", name: "Mubarak Al-Abdullah", sourceName: "MUBARAK AL-ABDULLAH" },
      { id: "bayan", name: "Bayan", sourceName: "BAYAN" },
      { id: "jabriya", name: "Jabriya", sourceName: "AL-JABRIYA" },
      { id: "ministries-area", name: "Ministries Area", sourceName: "MINISTRIES AREA" },
      { id: "shuhada", name: "Shuhada", sourceName: "AL-SHUHADA" },
      { id: "zahra", name: "Zahra", sourceName: "AL-ZAHRA" },
      { id: "hitteen", name: "Hitteen", sourceName: "HATEEN" },
      { id: "siddiq", name: "Siddiq", sourceName: "AL-SIDDIQ" },
      { id: "salam", name: "Salam", sourceName: "AL-SALAM" },
      { id: "anjafa", name: "Anjafa", sourceName: "ANJAFA" },
    ],
  },
  {
    id: "ahmadi",
    name: "Ahmadi",
    areas: [
      { id: "ahmadi", name: "Ahmadi", sourceName: "AL-AHMADI CITY" },
      { id: "fahaheel", name: "Fahaheel", sourceName: "AL-FAHAHEEL" },
      { id: "sabahiya", name: "Sabahiya", sourceName: "AL-SABAHIYA" },
      { id: "south-sabahiya", name: "South Sabahiya", sourceName: "SOUTH AL-SABAHIYA" },
      { id: "riqqa", name: "Riqqa", sourceName: "AL-RIQQA" },
      { id: "hadiya", name: "Hadiya", sourceName: "HADIYA" },
      { id: "fintas", name: "Fintas", sourceName: "AL-FINTAS" },
      { id: "jaber-al-ali", name: "Jaber Al-Ali", sourceName: "JABER AL-ALI" },
      { id: "eqaila", name: "Eqaila", sourceName: "AL-AQILA" },
      { id: "mahboula", name: "Mahboula", sourceName: "AL-MAHBULA" },
      { id: "abu-halifa", name: "Abu Halifa", sourceName: "ABU HALIFA" },
      { id: "mangaf", name: "Mangaf", sourceName: "ALMANGAF" },
      { id: "dhaher", name: "Dhaher", sourceName: "AL-DHAHER" },
      { id: "shuaiba", name: "Shuaiba", sourceName: "AL-SHUAIBA" },
      { id: "shuaiba-industrial", name: "Shuaiba Industrial", sourceName: "AL-SHUAIBA INDUSTRIAL" },
      { id: "mina-abdullah", name: "Mina Abdullah", sourceName: "ABDULLAH PORT" },
      { id: "mina-abdullah-chalets", name: "Mina Abdullah Chalets", sourceName: "ABDULLAH PORT CHALETS" },
      { id: "nuwaiseeb-chalets", name: "Nuwaiseeb Chalets", sourceName: "AL-NUWAISEEB CHALETS" },
      { id: "khairan-chalets", name: "Khairan Chalets", sourceName: "AL-KHAIRAN CHALETS" },
      { id: "zoor-chalets", name: "Zoor Chalets", sourceName: "AL-ZOOR CHALETS" },
      { id: "julaia-chalets", name: "Julaia Chalets", sourceName: "JULAIA CHALETS" },
      { id: "bnaider-chalets", name: "Bnaider Chalets", sourceName: "BNAIDER CHALETS" },
      { id: "dubaiya-chalets", name: "Dubaiya Chalets", sourceName: "AL-DUBAIYA CHALETS" },
      { id: "zoor", name: "Zoor", sourceName: "AL-ZOOR" },
      { id: "wafra", name: "Wafra", sourceName: "AL-WAFRA" },
      { id: "wafra-residential", name: "Wafra Residential", sourceName: "AL-WAFRA RESIDENTIAL" },
      { id: "wafra-farms", name: "Wafra Farms", sourceName: "WAFRA FARMS" },
      { id: "ahmadi-desert", name: "Ahmadi Desert", sourceName: "AL-AHMADI GOVERNORATE DESERT" },
      { id: "south-jawakher", name: "South Jawakher", sourceName: "SOUTH JAWAKHER" },
      { id: "fahad-al-ahmad", name: "Fahad Al-Ahmad", sourceName: "FAHAD AL-AHMAD AL-JABER" },
      { id: "ali-sabah-al-salem", name: "Ali Sabah Al-Salem", sourceName: "ALI SABAH AL-SALIM" },
      { id: "rajm-khashman", name: "Rajm Khashman", sourceName: "RAJM KHASHMAN" },
      { id: "sabah-al-ahmad-sea-city", name: "Sabah Al-Ahmad Sea City", sourceName: "SABAH AL-AHMAD SEA CITY" },
      { id: "sabah-al-ahmad-city-1", name: "Sabah Al-Ahmad City 1", sourceName: "SABAH AL-AHMAD CITY 1" },
      { id: "sabah-al-ahmad-city-2", name: "Sabah Al-Ahmad City 2", sourceName: "SABAH AL-AHMAD CITY 2" },
      { id: "sabah-al-ahmad-city-3", name: "Sabah Al-Ahmad City 3", sourceName: "SABAH AL-AHMAD CITY 3" },
      { id: "sabah-al-ahmad-city-4", name: "Sabah Al-Ahmad City 4", sourceName: "SABAH AL-AHMAD CITY 4" },
      { id: "sabah-al-ahmad-city-5", name: "Sabah Al-Ahmad City 5", sourceName: "SABAH AL-AHMAD CITY 5" },
      { id: "kabd-agricultural", name: "Kabd Agricultural", sourceName: "KABAD AGRICULTURAL" },
      { id: "khairan-residential", name: "Khairan Residential", sourceName: "AL-KHAIRAN RESIDENTIAL" },
      { id: "shadadiya-industrial", name: "Shadadiya Industrial", sourceName: "AL-SHADADIYA INDUSTRAIL" },
    ],
  },
  {
    id: "jahra",
    name: "Jahra",
    areas: [
      { id: "jahra", name: "Jahra", sourceName: "AL-JAHRA" },
      { id: "qasr", name: "Qasr", sourceName: "AL-QASR" },
      { id: "naeem", name: "Naeem", sourceName: "AL-NAEEEM" },
      { id: "nasseem", name: "Nasseem", sourceName: "AL-NASSEEM" },
      { id: "taima", name: "Taima", sourceName: "TAIMA" },
      { id: "waha", name: "Waha", sourceName: "AL-WAHA" },
      { id: "oyoun", name: "Oyoun", sourceName: "AL-OYOUN" },
      { id: "jahra-industrial", name: "Jahra Industrial", sourceName: "AL-JAHRA INDUSTRIAL 1" },
      { id: "sulaibiya-residential", name: "Sulaibiya Residential", sourceName: "AL-SULAIBIYA RESIDENTIAL" },
      { id: "sulaibiya-industrial-1", name: "Sulaibiya Industrial 1", sourceName: "AL-SULAIBIYA INDUSTRAIL 1" },
      { id: "sulaibiya-industrial-2", name: "Sulaibiya Industrial 2", sourceName: "AL-SULAIBIYA INDUSTRAIL 2" },
      { id: "sulaibiya-industrial-3", name: "Sulaibiya Industrial 3", sourceName: "AL-SULAIBIYA INDUSTRAIL 3" },
      { id: "sulaibiya-agricultural", name: "Sulaibiya Agricultural", sourceName: "AL-SULAIBIYA AGRICULTURAL" },
      { id: "abdali", name: "Abdali", sourceName: "AL-ABDALLI" },
      { id: "amghara-industrial", name: "Amghara Industrial", sourceName: "AMGHARA INDUSTRIAL" },
      { id: "mutlaa", name: "Mutlaa", sourceName: "AL-MUTLA" },
      { id: "kazma", name: "Kazma", sourceName: "KAZMAH" },
      { id: "rawdatain", name: "Rawdatain", sourceName: "AL-RAWADATAIN" },
      { id: "umm-al-aish", name: "Umm Al-Aish", sourceName: "UM ALAISH" },
      { id: "salmi", name: "Salmi", sourceName: "AL-SALMI" },
      { id: "kabd", name: "Kabd", sourceName: "KABAD" },
      { id: "subiya", name: "Subiya", sourceName: "AL-SUBIYA" },
      { id: "jahra-camps", name: "Jahra Camps", sourceName: "AL-JAHRA CAMPS" },
      { id: "jahra-desert", name: "Jahra Desert", sourceName: "AL-JAHRA GOVERNORATE DESERT" },
      { id: "saad-al-abdullah", name: "Saad Al-Abdullah", sourceName: "SAAD AL-ABDULLAH" },
      { id: "qairawan", name: "Qairawan", sourceName: "AL-QAIRAWAN" },
      { id: "jawakher-al-jahra", name: "Jawakher Al-Jahra", sourceName: "JAWAKHER AL-JAHRA" },
      { id: "north-west-jahra", name: "North West Jahra", sourceName: "NOURTH WEST AL-JAHRA" },
      { id: "naayim-industrial", name: "Naayim Industrial", sourceName: "AL-NAAYIM INDUSTRIAL" },
      { id: "south-mutlaa", name: "South Mutlaa", sourceName: "SOUTH AL-MITLAE" },
      { id: "sulaibikhat-cemetery", name: "Sulaibikhat Cemetery", sourceName: "AL-SULAIBIKHAT CEMETERY" },
      { id: "south-amghara", name: "South Amghara", sourceName: "SOUTH AMGHARA" },
      { id: "nahda", name: "Nahda", sourceName: "AL-NAHDA" },
    ],
  },
  {
    id: "farwaniya",
    name: "Farwaniya",
    areas: [
      { id: "farwaniya", name: "Farwaniya", sourceName: "AL-FARAWANIYA" },
      { id: "khaitan", name: "Khaitan", sourceName: "KHAITAN" },
      { id: "rai", name: "Rai", sourceName: "AL-RAI" },
      { id: "omariya", name: "Omariya", sourceName: "AL-OMARIYA" },
      { id: "rabiya", name: "Rabiya", sourceName: "AL-RABIYA" },
      { id: "rehab", name: "Rehab", sourceName: "AL-RIHAB" },
      { id: "jleeb-al-shuyoukh", name: "Jleeb Al-Shuyoukh", sourceName: "JLEEB AL-SHUYOUKH" },
      { id: "riggai", name: "Riggai", sourceName: "AL-RIGGAE" },
      { id: "andalus", name: "Andalus", sourceName: "AL-ANDALUS" },
      { id: "ardiya", name: "Ardiya", sourceName: "AL-ARDIYA" },
      { id: "sabah-al-nasser", name: "Sabah Al-Nasser", sourceName: "SABAH AL-NASSER" },
      { id: "ardiya-government-use", name: "Ardiya Government Use", sourceName: "AL-ARDIYA GOVERNORATE USE" },
      { id: "ishbiliya", name: "Ishbiliya", sourceName: "ASHBELYA" },
      { id: "ardiya-stores", name: "Ardiya Stores", sourceName: "AL-ARDIYA STORES" },
      { id: "firdous", name: "Firdous", sourceName: "AL-FORDOUS" },
      { id: "dajeej", name: "Dajeej", sourceName: "AL-DHAJEEJ" },
      { id: "airport-district", name: "Airport District", sourceName: "THE AIRPORT" },
      { id: "abdullah-al-mubarak", name: "Abdullah Al-Mubarak", sourceName: "ABDULLAH AL-MUBARAK" },
      { id: "ardiya-industrial", name: "Ardiya Industrial", sourceName: "AL-ARDIYA INDUSTRIAL" },
      { id: "west-abdullah-al-mubarak", name: "West Abdullah Al-Mubarak", sourceName: "WEST ABDULLAH AL-MUBARAK" },
    ],
  },
  {
    id: "mubarak-al-kabeer",
    name: "Mubarak Al-Kabeer",
    areas: [
      { id: "mubarak-al-kabeer", name: "Mubarak Al-Kabeer", sourceName: "MUBARAK AL-KABEER" },
      { id: "qurain", name: "Qurain", sourceName: "AL-QURIAN" },
      { id: "adan", name: "Adan", sourceName: "AL-ADAN" },
      { id: "qusour", name: "Qusour", sourceName: "AL-QUSOUR" },
      { id: "messila", name: "Messila", sourceName: "AL-MISILA" },
      { id: "masayel", name: "Masayel", sourceName: "AL-MASAYEL" },
      { id: "sabah-al-salem", name: "Sabah Al-Salem", sourceName: "SABAH AL-SALEM" },
      { id: "fnaitees", name: "Fnaitees", sourceName: "AL-FUNAITEES" },
      { id: "subhan-industrial", name: "Subhan Industrial", sourceName: "SABHAN INDUSTRAIL" },
      { id: "abu-ftaira", name: "Abu Ftaira", sourceName: "ABU FUTAIRA" },
      { id: "wista", name: "Wista", sourceName: "CENTRAL AREA" },
      { id: "west-abu-ftaira", name: "West Abu Ftaira", sourceName: "WEST ABU FUTAIRA" },
      { id: "abu-al-hasaniya", name: "Abu Al-Hasaniya", sourceName: "ABU AL-HASANIYA" },
    ],
  }
];

export function kuwaitGovernorateById(id: string): KuwaitGovernorate | undefined {
  return KUWAIT_GOVERNORATES.find((g) => g.id === id);
}

export function kuwaitAreasForGovernorate(governorateId: string): KuwaitArea[] {
  return kuwaitGovernorateById(governorateId)?.areas ?? [];
}

export function findKuwaitArea(
  governorateId: string,
  areaId: string,
): KuwaitArea | undefined {
  return kuwaitAreasForGovernorate(governorateId).find((a) => a.id === areaId);
}

export function isValidKuwaitLocation(governorateId: string, areaId: string): boolean {
  return !!findKuwaitArea(governorateId, areaId);
}

function norm(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "");
}

export function resolveKuwaitLocation(stored: string | null | undefined): {
  governorateId: string;
  areaId: string;
} | null {
  const rawValue = (stored ?? "").trim();
  if (!rawValue) return null;
  const n = norm(rawValue);
  const matches: { governorateId: string; areaId: string }[] = [];
  for (const g of KUWAIT_GOVERNORATES) {
    for (const a of g.areas) {
      if (
        a.id === rawValue ||
        norm(a.name) === n ||
        norm(a.sourceName) === n ||
        a.name.toLowerCase() === rawValue.toLowerCase()
      ) {
        matches.push({ governorateId: g.id, areaId: a.id });
      }
    }
  }
  if (matches.length !== 1) return null;
  return matches[0];
}

export function kuwaitLocationLabel(governorateId: string, areaId: string): string {
  return findKuwaitArea(governorateId, areaId)?.name ?? "";
}

export type BranchLocationFields = {
  governorate?: string | null;
  area?: string | null;
  location?: string | null;
};

/** PACI labels for UI. Same area/governorate name → area only (e.g. Farwaniya). */
export function formatBranchLocation(branch: BranchLocationFields): string {
  const govId = (branch.governorate ?? "").trim();
  const areaId = (branch.area ?? "").trim();
  if (govId && areaId && isValidKuwaitLocation(govId, areaId)) {
    const areaName = findKuwaitArea(govId, areaId)?.name ?? "";
    const govName = kuwaitGovernorateById(govId)?.name ?? "";
    if (!areaName) return (branch.location ?? "").trim();
    if (!govName || norm(areaName) === norm(govName)) return areaName;
    return `${areaName}, ${govName}`;
  }
  return (branch.location ?? "").trim();
}

export function branchLocationSearchText(branch: BranchLocationFields & { name?: string | null }): string {
  const govId = (branch.governorate ?? "").trim();
  const areaId = (branch.area ?? "").trim();
  const govName = kuwaitGovernorateById(govId)?.name ?? "";
  const areaName = findKuwaitArea(govId, areaId)?.name ?? "";
  return [
    branch.name ?? "",
    formatBranchLocation(branch),
    govName,
    areaName,
    govId,
    areaId,
    branch.location ?? "",
  ]
    .join(" ")
    .toLowerCase();
}
