// Lista de los 48 equipos del Mundial 2026 (clasificados confirmados o muy probables)
// Cada equipo tiene: TLA (código de 3 letras), nombre en español, ISO2 para bandera

export interface WC2026Team {
  tla: string
  name: string
  iso2: string
}

export const WC_2026_TEAMS: WC2026Team[] = [
  // CONMEBOL
  { tla: 'ARG', name: 'Argentina', iso2: 'ar' },
  { tla: 'BRA', name: 'Brasil', iso2: 'br' },
  { tla: 'URU', name: 'Uruguay', iso2: 'uy' },
  { tla: 'COL', name: 'Colombia', iso2: 'co' },
  { tla: 'ECU', name: 'Ecuador', iso2: 'ec' },
  { tla: 'PAR', name: 'Paraguay', iso2: 'py' },
  { tla: 'CHI', name: 'Chile', iso2: 'cl' },
  { tla: 'PER', name: 'Perú', iso2: 'pe' },
  { tla: 'BOL', name: 'Bolivia', iso2: 'bo' },
  { tla: 'VEN', name: 'Venezuela', iso2: 've' },

  // UEFA
  { tla: 'FRA', name: 'Francia', iso2: 'fr' },
  { tla: 'GER', name: 'Alemania', iso2: 'de' },
  { tla: 'ESP', name: 'España', iso2: 'es' },
  { tla: 'ENG', name: 'Inglaterra', iso2: 'gb-eng' },
  { tla: 'POR', name: 'Portugal', iso2: 'pt' },
  { tla: 'NED', name: 'Países Bajos', iso2: 'nl' },
  { tla: 'BEL', name: 'Bélgica', iso2: 'be' },
  { tla: 'ITA', name: 'Italia', iso2: 'it' },
  { tla: 'CRO', name: 'Croacia', iso2: 'hr' },
  { tla: 'DEN', name: 'Dinamarca', iso2: 'dk' },
  { tla: 'SUI', name: 'Suiza', iso2: 'ch' },
  { tla: 'AUT', name: 'Austria', iso2: 'at' },
  { tla: 'POL', name: 'Polonia', iso2: 'pl' },
  { tla: 'SCO', name: 'Escocia', iso2: 'gb-sct' },
  { tla: 'TUR', name: 'Turquía', iso2: 'tr' },
  { tla: 'NOR', name: 'Noruega', iso2: 'no' },
  { tla: 'SRB', name: 'Serbia', iso2: 'rs' },
  { tla: 'UKR', name: 'Ucrania', iso2: 'ua' },
  { tla: 'SWE', name: 'Suecia', iso2: 'se' },
  { tla: 'CZE', name: 'Chequia', iso2: 'cz' },
  { tla: 'HUN', name: 'Hungría', iso2: 'hu' },
  { tla: 'SVK', name: 'Eslovaquia', iso2: 'sk' },
  { tla: 'SVN', name: 'Eslovenia', iso2: 'si' },
  { tla: 'WAL', name: 'Gales', iso2: 'gb-wls' },
  { tla: 'BIH', name: 'Bosnia y Herzegovina', iso2: 'ba' },
  { tla: 'ALB', name: 'Albania', iso2: 'al' },
  { tla: 'MNE', name: 'Montenegro', iso2: 'me' },
  { tla: 'GRE', name: 'Grecia', iso2: 'gr' },
  { tla: 'ROU', name: 'Rumanía', iso2: 'ro' },
  { tla: 'NIR', name: 'Irlanda del Norte', iso2: 'gb-nir' },

  // AFC
  { tla: 'JPN', name: 'Japón', iso2: 'jp' },
  { tla: 'KOR', name: 'Corea del Sur', iso2: 'kr' },
  { tla: 'AUS', name: 'Australia', iso2: 'au' },
  { tla: 'IRN', name: 'Irán', iso2: 'ir' },
  { tla: 'KSA', name: 'Arabia Saudí', iso2: 'sa' },
  { tla: 'QAT', name: 'Catar', iso2: 'qa' },
  { tla: 'IRQ', name: 'Irak', iso2: 'iq' },
  { tla: 'UAE', name: 'Emiratos Árabes', iso2: 'ae' },
  { tla: 'JOR', name: 'Jordania', iso2: 'jo' },
  { tla: 'BHR', name: 'Baréin', iso2: 'bh' },
  { tla: 'CHN', name: 'China', iso2: 'cn' },

  // CAF
  { tla: 'MAR', name: 'Marruecos', iso2: 'ma' },
  { tla: 'SEN', name: 'Senegal', iso2: 'sn' },
  { tla: 'EGY', name: 'Egipto', iso2: 'eg' },
  { tla: 'GHA', name: 'Ghana', iso2: 'gh' },
  { tla: 'NGA', name: 'Nigeria', iso2: 'ng' },
  { tla: 'CMR', name: 'Camerún', iso2: 'cm' },
  { tla: 'ALG', name: 'Argelia', iso2: 'dz' },
  { tla: 'TUN', name: 'Túnez', iso2: 'tn' },
  { tla: 'RSA', name: 'Sudáfrica', iso2: 'za' },
  { tla: 'CPV', name: 'Cabo Verde', iso2: 'cv' },
  { tla: 'CIV', name: 'Costa de Marfil', iso2: 'ci' },
  { tla: 'MLI', name: 'Malí', iso2: 'ml' },

  // CONCACAF
  { tla: 'MEX', name: 'México', iso2: 'mx' },
  { tla: 'USA', name: 'Estados Unidos', iso2: 'us' },
  { tla: 'CAN', name: 'Canadá', iso2: 'ca' },
  { tla: 'PAN', name: 'Panamá', iso2: 'pa' },
  { tla: 'JAM', name: 'Jamaica', iso2: 'jm' },
  { tla: 'HAI', name: 'Haití', iso2: 'ht' },
  { tla: 'CRC', name: 'Costa Rica', iso2: 'cr' },
  { tla: 'HON', name: 'Honduras', iso2: 'hn' },
  { tla: 'CUW', name: 'Curaçao', iso2: 'cw' },
  { tla: 'SLV', name: 'El Salvador', iso2: 'sv' },
  { tla: 'GUA', name: 'Guatemala', iso2: 'gt' },
  { tla: 'CUB', name: 'Cuba', iso2: 'cu' },

  // OFC
  { tla: 'NZL', name: 'Nueva Zelanda', iso2: 'nz' },
]

export function getTeamByTla(tla: string): WC2026Team | undefined {
  return WC_2026_TEAMS.find((t) => t.tla === tla.toUpperCase())
}
