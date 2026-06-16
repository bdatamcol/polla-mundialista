// football-data.org API Client
// Plan gratuito: 10 calls/minuto, incluye World Cup

const BASE_URL = 'https://api.football-data.org/v4'

interface FootballTeam {
  id: number
  name: string
  shortName: string
  tla: string
  crest: string
}

interface FootballMatch {
  id: number
  utcDate: string
  status: 'SCHEDULED' | 'LIVE' | 'IN_PLAY' | 'PAUSED' | 'FINISHED' | 'POSTPONED' | 'SUSPENDED' | 'CANCELLED'
  matchday: number
  group?: string
  homeTeam: FootballTeam
  awayTeam: FootballTeam
  score: {
    fullTime: { home: number | null; away: number | null }
    halfTime: { home: number | null; away: number | null }
  }
  competition: {
    id: number
    name: string
    code: string
    emblem: string
  }
  lastUpdated: string
}

const WORLD_CUP_COMPETITION_ID = 2000

// Diccionario de traducción de equipos a español
// iso2: código de país para flagcdn.com (formato: https://flagcdn.com/w160/{code}.png)
const TEAM_TRANSLATIONS: Record<string, { name: string; flag: string; iso2: string }> = {
  // Equipos principales del Mundial 2026
  ARG: { name: 'Argentina', flag: '🇦🇷', iso2: 'ar' },
  BRA: { name: 'Brasil', flag: '🇧🇷', iso2: 'br' },
  FRA: { name: 'Francia', flag: '🇫🇷', iso2: 'fr' },
  GER: { name: 'Alemania', flag: '🇩🇪', iso2: 'de' },
  ESP: { name: 'España', flag: '🇪🇸', iso2: 'es' },
  ITA: { name: 'Italia', flag: '🇮🇹', iso2: 'it' },
  ENG: { name: 'Inglaterra', flag: '🏴', iso2: 'gb-eng' },
  POR: { name: 'Portugal', flag: '🇵🇹', iso2: 'pt' },
  NED: { name: 'Países Bajos', flag: '🇳🇱', iso2: 'nl' },
  BEL: { name: 'Bélgica', flag: '🇧🇪', iso2: 'be' },
  URU: { name: 'Uruguay', flag: '🇺🇾', iso2: 'uy' },
  COL: { name: 'Colombia', flag: '🇨🇴', iso2: 'co' },
  MEX: { name: 'México', flag: '🇲🇽', iso2: 'mx' },
  USA: { name: 'Estados Unidos', flag: '🇺🇸', iso2: 'us' },
  CAN: { name: 'Canadá', flag: '🇨🇦', iso2: 'ca' },
  JPN: { name: 'Japón', flag: '🇯🇵', iso2: 'jp' },
  KOR: { name: 'Corea del Sur', flag: '🇰🇷', iso2: 'kr' },
  AUS: { name: 'Australia', flag: '🇦🇺', iso2: 'au' },
  CRC: { name: 'Costa Rica', flag: '🇨🇷', iso2: 'cr' },
  CRO: { name: 'Croacia', flag: '🇭🇷', iso2: 'hr' },
  DEN: { name: 'Dinamarca', flag: '🇩🇰', iso2: 'dk' },
  ECU: { name: 'Ecuador', flag: '🇪🇨', iso2: 'ec' },
  IRN: { name: 'Irán', flag: '🇮🇷', iso2: 'ir' },
  MAR: { name: 'Marruecos', flag: '🇲🇦', iso2: 'ma' },
  POL: { name: 'Polonia', flag: '🇵🇱', iso2: 'pl' },
  SUI: { name: 'Suiza', flag: '🇨🇭', iso2: 'ch' },
  SEN: { name: 'Senegal', flag: '🇸🇳', iso2: 'sn' },
  SRB: { name: 'Serbia', flag: '🇷🇸', iso2: 'rs' },
  SWE: { name: 'Suecia', flag: '🇸🇪', iso2: 'se' },
  TUN: { name: 'Túnez', flag: '🇹🇳', iso2: 'tn' },
  UKR: { name: 'Ucrania', flag: '🇺🇦', iso2: 'ua' },
  WAL: { name: 'Gales', flag: '🏴', iso2: 'gb-wls' },
  CMR: { name: 'Camerún', flag: '🇨🇲', iso2: 'cm' },
  GHA: { name: 'Ghana', flag: '🇬🇭', iso2: 'gh' },
  NGA: { name: 'Nigeria', flag: '🇳🇬', iso2: 'ng' },
  CHI: { name: 'Chile', flag: '🇨🇱', iso2: 'cl' },
  PAR: { name: 'Paraguay', flag: '🇵🇾', iso2: 'py' },
  PER: { name: 'Perú', flag: '🇵🇪', iso2: 'pe' },
  VEN: { name: 'Venezuela', flag: '🇻🇪', iso2: 've' },
  BOL: { name: 'Bolivia', flag: '🇧🇴', iso2: 'bo' },
  AUT: { name: 'Austria', flag: '🇦🇹', iso2: 'at' },
  CZE: { name: 'Chequia', flag: '🇨🇿', iso2: 'cz' },
  HUN: { name: 'Hungría', flag: '🇭🇺', iso2: 'hu' },
  NOR: { name: 'Noruega', flag: '🇳🇴', iso2: 'no' },
  SCO: { name: 'Escocia', flag: '🏴', iso2: 'gb-sct' },
  TUR: { name: 'Turquía', flag: '🇹🇷', iso2: 'tr' },
  GRE: { name: 'Grecia', flag: '🇬🇷', iso2: 'gr' },
  RUS: { name: 'Rusia', flag: '🇷🇺', iso2: 'ru' },
  KSA: { name: 'Arabia Saudí', flag: '🇸🇦', iso2: 'sa' },
  QAT: { name: 'Catar', flag: '🇶🇦', iso2: 'qa' },
  IRL: { name: 'Irlanda', flag: '🇮🇪', iso2: 'ie' },
  ALG: { name: 'Argelia', flag: '🇩🇿', iso2: 'dz' },
  EGY: { name: 'Egipto', flag: '🇪🇬', iso2: 'eg' },
  CIV: { name: 'Costa de Marfil', flag: '🇨🇮', iso2: 'ci' },
  MLI: { name: 'Malí', flag: '🇲🇱', iso2: 'ml' },
  PAN: { name: 'Panamá', flag: '🇵🇦', iso2: 'pa' },
  JAM: { name: 'Jamaica', flag: '🇯🇲', iso2: 'jm' },
  HAI: { name: 'Haití', flag: '🇭🇹', iso2: 'ht' },
  HON: { name: 'Honduras', flag: '🇭🇳', iso2: 'hn' },
  SLV: { name: 'El Salvador', flag: '🇸🇻', iso2: 'sv' },
  GUA: { name: 'Guatemala', flag: '🇬🇹', iso2: 'gt' },
  CUB: { name: 'Cuba', flag: '🇨🇺', iso2: 'cu' },
  UGA: { name: 'Uganda', flag: '🇺🇬', iso2: 'ug' },
  ZAM: { name: 'Zambia', flag: '🇿🇲', iso2: 'zm' },
  COD: { name: 'RD Congo', flag: '🇨🇩', iso2: 'cd' },
  RSA: { name: 'Sudáfrica', flag: '🇿🇦', iso2: 'za' },
  CPV: { name: 'Cabo Verde', flag: '🇨🇻', iso2: 'cv' },
  IRQ: { name: 'Irak', flag: '🇮🇶', iso2: 'iq' },
  UAE: { name: 'EAU', flag: '🇦🇪', iso2: 'ae' },
  JOR: { name: 'Jordania', flag: '🇯🇴', iso2: 'jo' },
  BHR: { name: 'Baréin', flag: '🇧🇭', iso2: 'bh' },
  CHN: { name: 'China', flag: '🇨🇳', iso2: 'cn' },
  PRK: { name: 'Corea del Norte', flag: '🇰🇵', iso2: 'kp' },
  IND: { name: 'India', flag: '🇮🇳', iso2: 'in' },
  THA: { name: 'Tailandia', flag: '🇹🇭', iso2: 'th' },
  VIE: { name: 'Vietnam', flag: '🇻🇳', iso2: 'vn' },
  IDN: { name: 'Indonesia', flag: '🇮🇩', iso2: 'id' },
  PHI: { name: 'Filipinas', flag: '🇵🇭', iso2: 'ph' },
  NZL: { name: 'Nueva Zelanda', flag: '🇳🇿', iso2: 'nz' },
  FIN: { name: 'Finlandia', flag: '🇫🇮', iso2: 'fi' },
  ISL: { name: 'Islandia', flag: '🇮🇸', iso2: 'is' },
  ISR: { name: 'Israel', flag: '🇮🇱', iso2: 'il' },
  ROU: { name: 'Rumanía', flag: '🇷🇴', iso2: 'ro' },
  BUL: { name: 'Bulgaria', flag: '🇧🇬', iso2: 'bg' },
  SVK: { name: 'Eslovaquia', flag: '🇸🇰', iso2: 'sk' },
  SVN: { name: 'Eslovenia', flag: '🇸🇮', iso2: 'si' },
  ALB: { name: 'Albania', flag: '🇦🇱', iso2: 'al' },
  MNE: { name: 'Montenegro', flag: '🇲🇪', iso2: 'me' },
  BIH: { name: 'Bosnia y Herzegovina', flag: '🇧🇦', iso2: 'ba' },
  MKD: { name: 'Macedonia del Norte', flag: '🇲🇰', iso2: 'mk' },
  KVX: { name: 'Kosovo', flag: '🇽🇰', iso2: 'xk' },
  MLT: { name: 'Malta', flag: '🇲🇹', iso2: 'mt' },
  CYP: { name: 'Chipre', flag: '🇨🇾', iso2: 'cy' },
  LUX: { name: 'Luxemburgo', flag: '🇱🇺', iso2: 'lu' },
  LTU: { name: 'Lituania', flag: '🇱🇹', iso2: 'lt' },
  LVA: { name: 'Letonia', flag: '🇱🇻', iso2: 'lv' },
  EST: { name: 'Estonia', flag: '🇪🇪', iso2: 'ee' },
  GEO: { name: 'Georgia', flag: '🇬🇪', iso2: 'ge' },
  ARM: { name: 'Armenia', flag: '🇦🇲', iso2: 'am' },
  AZE: { name: 'Azerbaiyán', flag: '🇦🇿', iso2: 'az' },
  KAZ: { name: 'Kazajistán', flag: '🇰🇿', iso2: 'kz' },
  UZB: { name: 'Uzbekistán', flag: '🇺🇿', iso2: 'uz' },
  // Equipos clasificados al Mundial 2026 con códigos TLA faltantes
  CUW: { name: 'Curaçao', flag: '🇨🇼', iso2: 'cw' },
  NIR: { name: 'Irlanda del Norte', flag: '🇬🇬', iso2: 'gb-nir' },
}

// Mapeo de nombres en inglés que devuelve la API a códigos TLA
// (cuando la API no provee un TLA correcto)
const ENGLISH_NAME_TO_TLA: Record<string, string> = {
  'south korea': 'KOR',
  'korea republic': 'KOR',
  'korea, republic of': 'KOR',
  'czechia': 'CZE',
  'czech republic': 'CZE',
  'bosnia-herzegovina': 'BIH',
  'bosnia & herzegovina': 'BIH',
  'united states': 'USA',
  'united states of america': 'USA',
  'côte d\'ivoire': 'CIV',
  'cote d\'ivoire': 'CIV',
  'curacao': 'CUW',
  'curaçao': 'CUW',
  'northern ireland': 'NIR',
  'uae': 'UAE',
  'south africa': 'RSA',
  'korea': 'KOR',
  'iran': 'IRN',
  'syria': 'SYR',
  'cabo verde': 'CPV',
  'cape verde': 'CPV',
  'ivory coast': 'CIV',
  'cabo verde islands': 'CPV',
}

// Función para obtener nombre, bandera y código ISO2 del equipo
function getTeamInfo(team: FootballTeam): { name: string; flag: string; iso2: string | null } {
  if (!team || !team.tla) {
    return { name: 'TBD', flag: '🏳️', iso2: null }
  }

  const tla = team.tla
  const translation = TEAM_TRANSLATIONS[tla]

  if (translation) {
    return { name: translation.name, flag: translation.flag, iso2: translation.iso2 }
  }

  // Si no hay traducción por TLA, intentar por nombre en inglés
  if (team.name) {
    const englishKey = team.name.toLowerCase().trim()
    const fallbackTla = ENGLISH_NAME_TO_TLA[englishKey]
    if (fallbackTla && TEAM_TRANSLATIONS[fallbackTla]) {
      const fb = TEAM_TRANSLATIONS[fallbackTla]
      return { name: fb.name, flag: fb.flag, iso2: fb.iso2 }
    }
  }

  // Si no hay traducción, usar el nombre corto o el nombre completo
  return {
    name: team.shortName || team.name || tla,
    flag: '🏳️',
    iso2: null,
  }
}

export async function fetchWithAuth(url: string): Promise<Response> {
  const apiKey = process.env.FOOTBALL_DATA_API_KEY

  if (!apiKey) {
    throw new Error('FOOTBALL_DATA_API_KEY no está configurada')
  }

  return fetch(url, {
    headers: {
      'X-Auth-Token': apiKey,
    },
    next: { revalidate: 60 },
  })
}

export async function getWorldCupMatches(): Promise<FootballMatch[]> {
  const response = await fetchWithAuth(
    `${BASE_URL}/competitions/${WORLD_CUP_COMPETITION_ID}/matches?season=2026`
  )

  if (!response.ok) {
    throw new Error(`Error fetching matches: ${response.status}`)
  }

  const data = await response.json()
  return data.matches || []
}

export async function getLiveMatches(): Promise<FootballMatch[]> {
  const response = await fetchWithAuth(`${BASE_URL}/matches?status=LIVE`)

  if (!response.ok) {
    throw new Error(`Error fetching live matches: ${response.status}`)
  }

  const data = await response.json()
  return (data.matches || []).filter(
    (match: FootballMatch) => match.competition.id === WORLD_CUP_COMPETITION_ID
  )
}

// Detecta la fase del torneo a partir del campo "group" o "matchday" de football-data.org
function detectPhase(group: string | undefined, matchday: number | undefined): {
  phase: 'GROUP' | 'ROUND_OF_16' | 'QUARTER_FINAL' | 'SEMI_FINAL' | 'THIRD_PLACE' | 'FINAL'
  groupLabel: string
} {
  const raw = (group || '').toUpperCase()

  // Fases eliminatorias
  if (raw.includes('FINAL') && !raw.includes('SEMI') && !raw.includes('QUARTER') && !raw.includes('THIRD')) {
    return { phase: 'FINAL', groupLabel: 'Final' }
  }
  if (raw.includes('THIRD') || raw.includes('3RD') || raw.includes('TERCER')) {
    return { phase: 'THIRD_PLACE', groupLabel: 'Tercer lugar' }
  }
  if (raw.includes('SEMI')) {
    return { phase: 'SEMI_FINAL', groupLabel: 'Semifinal' }
  }
  if (raw.includes('QUARTER')) {
    return { phase: 'QUARTER_FINAL', groupLabel: 'Cuartos de final' }
  }
  if (
    raw.includes('LAST_16') || raw.includes('ROUND_OF_16') || raw.includes('LAST 16') ||
    raw.includes('OCTAVOS') || raw.includes('R16') || raw.includes('KNOCKOUT')
  ) {
    return { phase: 'ROUND_OF_16', groupLabel: 'Octavos de final' }
  }

  // Fase de grupos: el campo group trae "GROUP_A", "GROUP_B", etc. (Mundial 2026 son 12 grupos)
  if (raw.startsWith('GROUP_')) {
    const letter = raw.replace('GROUP_', '').trim()
    return { phase: 'GROUP', groupLabel: `Grupo ${letter}` }
  }

  // Fallback por matchday
  if (matchday) {
    if (matchday >= 13 && matchday <= 16) {
      return { phase: 'ROUND_OF_16', groupLabel: 'Octavos de final' }
    }
    if (matchday === 17 || matchday === 18) {
      return { phase: 'QUARTER_FINAL', groupLabel: 'Cuartos de final' }
    }
    if (matchday === 19 || matchday === 20) {
      return { phase: 'SEMI_FINAL', groupLabel: 'Semifinal' }
    }
    if (matchday === 21) {
      return { phase: 'THIRD_PLACE', groupLabel: 'Tercer lugar' }
    }
    if (matchday === 22) {
      return { phase: 'FINAL', groupLabel: 'Final' }
    }
  }

  return { phase: 'GROUP', groupLabel: 'Fase de grupos' }
}

export function mapFootballMatchToMatch(footballMatch: FootballMatch) {
  // Detectar fase y label del grupo
  const phaseInfo = detectPhase(footballMatch.group, footballMatch.matchday)
  let group = phaseInfo.groupLabel

  // Mantener fallback legacy por si la fase no se pudo detectar
  if (!group && footballMatch.matchday) {
    if (footballMatch.matchday <= 12) {
      const groupLetter = String.fromCharCode(64 + footballMatch.matchday)
      group = `Grupo ${groupLetter}`
    }
  }

  // Si no hay grupo, usar "Fase de grupos" como default
  if (!group) {
    group = 'Fase de grupos'
  }

  // Mapear estado
  let status: 'PENDING' | 'LIVE' | 'FINISHED'
  switch (footballMatch.status) {
    case 'FINISHED':
      status = 'FINISHED'
      break
    case 'LIVE':
    case 'IN_PLAY':
    case 'PAUSED':
      status = 'LIVE'
      break
    default:
      status = 'PENDING'
  }

  // Obtener info de equipos con traducción
  const homeInfo = getTeamInfo(footballMatch.homeTeam)
  const awayInfo = getTeamInfo(footballMatch.awayTeam)

  return {
    externalId: footballMatch.id.toString(),
    homeTeam: homeInfo.name,
    homeTeamFull: footballMatch.homeTeam.name || homeInfo.name,
    homeTeamFlag: homeInfo.flag,
    homeTeamCrest: footballMatch.homeTeam.crest,
    homeTeamTla: footballMatch.homeTeam.tla,
    homeTeamIso2: homeInfo.iso2,
    awayTeam: awayInfo.name,
    awayTeamFull: footballMatch.awayTeam.name || awayInfo.name,
    awayTeamFlag: awayInfo.flag,
    awayTeamCrest: footballMatch.awayTeam.crest,
    awayTeamTla: footballMatch.awayTeam.tla,
    awayTeamIso2: awayInfo.iso2,
    group,
    phase: phaseInfo.phase,
    matchDate: new Date(footballMatch.utcDate),
    status,
    homeGoals:
      footballMatch.score.fullTime.home !== null
        ? footballMatch.score.fullTime.home
        : undefined,
    awayGoals:
      footballMatch.score.fullTime.away !== null
        ? footballMatch.score.fullTime.away
        : undefined,
  }
}

export type { FootballMatch, FootballTeam }
