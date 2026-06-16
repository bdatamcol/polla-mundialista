// Sistema de banderas con múltiples fallbacks
// Fuentes: flagcdn.com (PNG) y un mapeo comprehensivo de TLA + nombre de país a ISO2

const BASE_FLAG_URL = 'https://flagcdn.com/w160'

// Mapeo principal: TLA (código de 3 letras) a ISO 3166-1 alpha-2
const TLA_TO_ISO2: Record<string, string> = {
  // Equipos principales del Mundial 2026
  ARG: 'ar', BRA: 'br', FRA: 'fr', GER: 'de', ESP: 'es', ITA: 'it',
  ENG: 'gb-eng', POR: 'pt', NED: 'nl', BEL: 'be', URU: 'uy', COL: 'co',
  MEX: 'mx', USA: 'us', CAN: 'ca', JPN: 'jp', KOR: 'kr', AUS: 'au',
  CRC: 'cr', CRO: 'hr', DEN: 'dk', ECU: 'ec', IRN: 'ir', MAR: 'ma',
  POL: 'pl', SUI: 'ch', SEN: 'sn', SRB: 'rs', SWE: 'se', TUN: 'tn',
  UKR: 'ua', WAL: 'gb-wls', CMR: 'cm', GHA: 'gh', NGA: 'ng', CHI: 'cl',
  PAR: 'py', PER: 'pe', VEN: 've', BOL: 'bo', AUT: 'at', CZE: 'cz',
  HUN: 'hu', NOR: 'no', SCO: 'gb-sct', TUR: 'tr', GRE: 'gr', RUS: 'ru',
  KSA: 'sa', QAT: 'qa', IRL: 'ie', ALG: 'dz', EGY: 'eg', CIV: 'ci',
  MLI: 'ml', PAN: 'pa', JAM: 'jm', HAI: 'ht', HON: 'hn', SLV: 'sv',
  GUA: 'gt', CUB: 'cu', UGA: 'ug', ZAM: 'zm', COD: 'cd', RSA: 'za',
  CPV: 'cv', IRQ: 'iq', UAE: 'ae', JOR: 'jo', BHR: 'bh', CHN: 'cn',
  PRK: 'kp', IND: 'in', THA: 'th', VIE: 'vn', IDN: 'id', PHI: 'ph',
  NZL: 'nz', FIN: 'fi', ISL: 'is', ISR: 'il', ROU: 'ro', BUL: 'bg',
  SVK: 'sk', SVN: 'si', ALB: 'al', MNE: 'me', BIH: 'ba', MKD: 'mk',
  MLT: 'mt', CYP: 'cy', LUX: 'lu', LTU: 'lt', LVA: 'lv', EST: 'ee',
  GEO: 'ge', ARM: 'am', AZE: 'az', KAZ: 'kz', UZB: 'uz', CUW: 'cw',
  NIR: 'gb-nir', KVX: 'xk', SYR: 'sy',
}

// Mapeo de fallback: nombre de país a ISO2
// Soporta nombres en español, inglés y variantes con guiones/puntos que usa la API
const COUNTRY_NAME_TO_ISO2: Record<string, string> = {
  // Nombres en español
  'méxico': 'mx', 'mexico': 'mx',
  'estados unidos': 'us', 'estados unidos de américa': 'us',
  'canadá': 'ca', 'corea del sur': 'kr', 'corea': 'kr',
  'australia': 'au', 'costa rica': 'cr', 'croacia': 'hr',
  'dinamarca': 'dk', 'ecuador': 'ec', 'irán': 'ir', 'iran': 'ir',
  'marruecos': 'ma', 'polonia': 'pl', 'suiza': 'ch',
  'senegal': 'sn', 'serbia': 'rs', 'suecia': 'se', 'túnez': 'tn',
  'tunez': 'tn', 'ucrania': 'ua', 'gales': 'gb-wls',
  'camerún': 'cm', 'camerun': 'cm', 'ghana': 'gh', 'nigeria': 'ng',
  'chile': 'cl', 'paraguay': 'py', 'perú': 'pe', 'peru': 'pe',
  'venezuela': 've', 'bolivia': 'bo', 'austria': 'at', 'chequia': 'cz',
  'república checa': 'cz', 'hungría': 'hu', 'hungria': 'hu',
  'noruega': 'no', 'escocia': 'gb-sct', 'turquía': 'tr', 'turquia': 'tr',
  'grecia': 'gr', 'rusia': 'ru', 'arabia saudí': 'sa', 'arabia saudi': 'sa',
  'catar': 'qa', 'irlanda': 'ie', 'argelia': 'dz', 'egipto': 'eg',
  'costa de marfil': 'ci', 'malí': 'ml', 'mali': 'ml', 'panamá': 'pa',
  'panama': 'pa', 'jamaica': 'jm', 'haití': 'ht', 'haiti': 'ht',
  'honduras': 'hn', 'el salvador': 'sv', 'guatemala': 'gt', 'cuba': 'cu',
  'uganda': 'ug', 'zambia': 'zm', 'rd congo': 'cd',
  'sudáfrica': 'za', 'sudafrica': 'za', 'cabo verde': 'cv',
  'irak': 'iq', 'eau': 'ae', 'jordania': 'jo', 'baréin': 'bh',
  'barein': 'bh', 'china': 'cn', 'corea del norte': 'kp',
  'india': 'in', 'tailandia': 'th', 'vietnam': 'vn',
  'indonesia': 'id', 'filipinas': 'ph', 'nueva zelanda': 'nz',
  'finlandia': 'fi', 'islandia': 'is', 'israel': 'il',
  'rumanía': 'ro', 'rumania': 'ro', 'bulgaria': 'bg',
  'eslovaquia': 'sk', 'eslovenia': 'si', 'albania': 'al',
  'montenegro': 'me', 'bosnia y herzegovina': 'ba',
  'bosnia': 'ba', 'macedonia del norte': 'mk', 'kosovo': 'xk',
  'malta': 'mt', 'chipre': 'cy', 'luxemburgo': 'lu',
  'lituania': 'lt', 'letonia': 'lv', 'estonia': 'ee',
  'georgia': 'ge', 'armenia': 'am', 'azerbaiyán': 'az',
  'azerbaiyan': 'az', 'kazajistán': 'kz', 'kazajistan': 'kz',
  'uzbekistán': 'uz', 'uzbekistan': 'uz', 'curaçao': 'cw',
  'curazao': 'cw', 'irlanda del norte': 'gb-nir',
  'inglaterra': 'gb-eng', 'españa': 'es', 'espana': 'es',
  'francia': 'fr', 'alemania': 'de', 'italia': 'it',
  'portugal': 'pt', 'países bajos': 'nl', 'paises bajos': 'nl',
  'holanda': 'nl', 'bélgica': 'be', 'belgica': 'be', 'uruguay': 'uy',
  'colombia': 'co', 'argentina': 'ar', 'brasil': 'br',
  'japón': 'jp', 'japon': 'jp',
  'jordan': 'jo', 'iraq': 'iq', 'syria': 'sy',

  // Nombres en INGLÉS (que es lo que devuelve la API)
  'canada': 'ca',
  'mexico': 'mx',
  'united states': 'us',
  'united states of america': 'us',
  'usa': 'us',
  'south korea': 'kr',
  'korea republic': 'kr',
  'korea': 'kr',
  'australia': 'au',
  'costa rica': 'cr',
  'croatia': 'hr',
  'denmark': 'dk',
  'ecuador': 'ec',
  'iran': 'ir',
  'morocco': 'ma',
  'poland': 'pl',
  'switzerland': 'ch',
  'senegal': 'sn',
  'serbia': 'rs',
  'sweden': 'se',
  'tunisia': 'tn',
  'ukraine': 'ua',
  'wales': 'gb-wls',
  'cameroon': 'cm',
  'ghana': 'gh',
  'nigeria': 'ng',
  'chile': 'cl',
  'paraguay': 'py',
  'peru': 'pe',
  'venezuela': 've',
  'bolivia': 'bo',
  'austria': 'at',
  'czechia': 'cz',
  'czech republic': 'cz',
  'hungary': 'hu',
  'norway': 'no',
  'scotland': 'gb-sct',
  'turkey': 'tr',
  'türkiye': 'tr',
  'greece': 'gr',
  'russia': 'ru',
  'saudi arabia': 'sa',
  'qatar': 'qa',
  'ireland': 'ie',
  'algeria': 'dz',
  'egypt': 'eg',
  'ivory coast': 'ci',
  'côte d\'ivoire': 'ci',
  'cote d\'ivoire': 'ci',
  'mali': 'ml',
  'panama': 'pa',
  'jamaica': 'jm',
  'haiti': 'ht',
  'honduras': 'hn',
  'el salvador': 'sv',
  'guatemala': 'gt',
  'cuba': 'cu',
  'uganda': 'ug',
  'zambia': 'zm',
  'dr congo': 'cd',
  'congo': 'cd',
  'south africa': 'za',
  'cape verde': 'cv',
  'cabo verde': 'cv',
  'iraq': 'iq',
  'united arab emirates': 'ae',
  'uae': 'ae',
  'jordan': 'jo',
  'bahrain': 'bh',
  'china': 'cn',
  'china pr': 'cn',
  'north korea': 'kp',
  'india': 'in',
  'thailand': 'th',
  'vietnam': 'vn',
  'indonesia': 'id',
  'philippines': 'ph',
  'new zealand': 'nz',
  'finland': 'fi',
  'iceland': 'is',
  'israel': 'il',
  'romania': 'ro',
  'bulgaria': 'bg',
  'slovakia': 'sk',
  'slovenia': 'si',
  'albania': 'al',
  'montenegro': 'me',
  'bosnia-herzegovina': 'ba',
  'bosnia & herzegovina': 'ba',
  'bosnia and herzegovina': 'ba',
  'north macedonia': 'mk',
  'kosovo': 'xk',
  'malta': 'mt',
  'cyprus': 'cy',
  'luxembourg': 'lu',
  'lithuania': 'lt',
  'latvia': 'lv',
  'estonia': 'ee',
  'georgia': 'ge',
  'armenia': 'am',
  'azerbaijan': 'az',
  'kazakhstan': 'kz',
  'uzbekistan': 'uz',
  'curacao': 'cw',
  'curaçao': 'cw',
  'northern ireland': 'gb-nir',
  'england': 'gb-eng',
  'spain': 'es',
  'france': 'fr',
  'germany': 'de',
  'italy': 'it',
  'portugal': 'pt',
  'netherlands': 'nl',
  'the netherlands': 'nl',
  'holland': 'nl',
  'belgium': 'be',
  'uruguay': 'uy',
  'colombia': 'co',
  'argentina': 'ar',
  'brazil': 'br',
  'japan': 'jp',
  'syria': 'sy',
}

/**
 * Normaliza un nombre de equipo: minúsculas, sin acentos, sin caracteres especiales
 */
function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Quita acentos
    .replace(/[.\-_]/g, ' ')         // Convierte puntos, guiones a espacios
    .replace(/\s+/g, ' ')             // Colapsa espacios múltiples
    .trim()
}

/**
 * Resuelve la URL de la bandera usando múltiples estrategias de fallback.
 * @param iso2 Código ISO 3166-1 alpha-2 (preferido, viene de la BD)
 * @param tla Código TLA de 3 letras (ej: COL, ARG)
 * @param teamName Nombre del equipo (fallback final)
 * @returns URL de la bandera o null si no se encuentra
 */
export function getFlagUrl(
  iso2?: string | null,
  tla?: string | null,
  teamName?: string | null
): string | null {
  // Prioridad 1: iso2 directo desde la BD
  if (iso2 && iso2.trim().length > 0) {
    return `${BASE_FLAG_URL}/${iso2.trim().toLowerCase()}.png`
  }

  // Prioridad 2: convertir TLA a iso2 (case-insensitive)
  if (tla) {
    const upperTla = tla.toUpperCase().trim()
    if (TLA_TO_ISO2[upperTla]) {
      return `${BASE_FLAG_URL}/${TLA_TO_ISO2[upperTla]}.png`
    }
  }

  // Prioridad 3: buscar por nombre de equipo (con normalización)
  if (teamName) {
    // Intento 1: nombre normalizado completo
    const normalized = normalizeName(teamName)
    if (COUNTRY_NAME_TO_ISO2[normalized]) {
      return `${BASE_FLAG_URL}/${COUNTRY_NAME_TO_ISO2[normalized]}.png`
    }
    // Intento 2: nombre normalizado sin puntuación
    const stripped = normalized.replace(/[^a-z0-9 ]/g, '').trim()
    if (stripped && COUNTRY_NAME_TO_ISO2[stripped]) {
      return `${BASE_FLAG_URL}/${COUNTRY_NAME_TO_ISO2[stripped]}.png`
    }
    // Intento 3: coincidencia parcial (busca palabras clave)
    for (const [key, iso2] of Object.entries(COUNTRY_NAME_TO_ISO2)) {
      if (normalized.includes(key) || key.includes(normalized)) {
        return `${BASE_FLAG_URL}/${iso2}.png`
      }
      // También intenta sin acentos
      const keyNoAccents = key.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      if (normalized.includes(keyNoAccents) || keyNoAccents.includes(normalized)) {
        return `${BASE_FLAG_URL}/${iso2}.png`
      }
    }
    // Intento 4: primera palabra del nombre (ej: "Korea Republic" → "korea")
    const firstWord = normalized.split(' ')[0]
    if (firstWord && COUNTRY_NAME_TO_ISO2[firstWord]) {
      return `${BASE_FLAG_URL}/${COUNTRY_NAME_TO_ISO2[firstWord]}.png`
    }
  }

  return null
}

/**
 * Emojis de bandera como fallback final (cuando la imagen no carga)
 */
export const TEAM_EMOJI_FLAGS: Record<string, string> = {
  ARG: '🇦🇷', BRA: '🇧🇷', FRA: '🇫🇷', GER: '🇩🇪', ESP: '🇪🇸', ITA: '🇮🇹',
  ENG: '🏴', POR: '🇵🇹', NED: '🇳🇱', BEL: '🇧🇪', URU: '🇺🇾', COL: '🇨🇴',
  MEX: '🇲🇽', USA: '🇺🇸', CAN: '🇨🇦', JPN: '🇯🇵', KOR: '🇰🇷', AUS: '🇦🇺',
  CRC: '🇨🇷', CRO: '🇭🇷', DEN: '🇩🇰', ECU: '🇪🇨', IRN: '🇮🇷', MAR: '🇲🇦',
  POL: '🇵🇱', SUI: '🇨🇭', SEN: '🇸🇳', SRB: '🇷🇸', SWE: '🇸🇪', TUN: '🇹🇳',
  UKR: '🇺🇦', WAL: '🏴', CMR: '🇨🇲', GHA: '🇬🇭', NGA: '🇳🇬', CHI: '🇨🇱',
  PAR: '🇵🇾', PER: '🇵🇪', VEN: '🇻🇪', BOL: '🇧🇴', AUT: '🇦🇹', CZE: '🇨🇿',
  HUN: '🇭🇺', NOR: '🇳🇴', SCO: '🏴', TUR: '🇹🇷', GRE: '🇬🇷', RUS: '🇷🇺',
  KSA: '🇸🇦', QAT: '🇶🇦', IRL: '🇮🇪', ALG: '🇩🇿', EGY: '🇪🇬', CIV: '🇨🇮',
  MLI: '🇲🇱', PAN: '🇵🇦', JAM: '🇯🇲', HAI: '🇭🇹', HON: '🇭🇳', SLV: '🇸🇻',
  GUA: '🇬🇹', CUB: '🇨🇺', UGA: '🇺🇬', ZAM: '🇿🇲', COD: '🇨🇩', RSA: '🇿🇦',
  CPV: '🇨🇻', IRQ: '🇮🇶', UAE: '🇦🇪', JOR: '🇯🇴', BHR: '🇧🇭', CHN: '🇨🇳',
  PRK: '🇰🇵', IND: '🇮🇳', THA: '🇹🇭', VIE: '🇻🇳', IDN: '🇮🇩', PHI: '🇵🇭',
  NZL: '🇳🇿', FIN: '🇫🇮', ISL: '🇮🇸', ISR: '🇮🇱', ROU: '🇷🇴', BUL: '🇧🇬',
  SVK: '🇸🇰', SVN: '🇸🇮', ALB: '🇦🇱', MNE: '🇲🇪', BIH: '🇧🇦', MKD: '🇲🇰',
  MLT: '🇲🇹', CYP: '🇨🇾', LUX: '🇱🇺', LTU: '🇱🇹', LVA: '🇱🇻', EST: '🇪🇪',
  GEO: '🇬🇪', ARM: '🇦🇲', AZE: '🇦🇿', KAZ: '🇰🇿', UZB: '🇺🇿', CUW: '🇨🇼',
  NIR: '🇬🇬', KVX: '🇽🇰',
}

export function getFlagEmoji(tla?: string | null): string {
  if (tla && TEAM_EMOJI_FLAGS[tla]) {
    return TEAM_EMOJI_FLAGS[tla]
  }
  return '🏳️'
}
