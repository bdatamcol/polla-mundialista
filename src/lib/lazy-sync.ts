// Lazy sync: sincroniza resultados automáticamente cuando los usuarios
// visitan la página, sin necesidad de Vercel Cron Pro.
// Solo sincroniza si hay partidos activos (en vivo o por comenzar)
// y si han pasado más de 5 minutos desde la última sincronización.

import { prisma } from '@/lib/prisma'

const SYNC_INTERVAL_MS = 5 * 60 * 1000 // 5 minutos
const LIVE_WINDOW_MS = 2 * 60 * 60 * 1000 // 2 horas antes de un partido

/**
 * Dispara una sincronización de resultados en background si es necesario.
 * No bloquea la respuesta de la página.
 */
export async function maybeLazySyncResults(): Promise<void> {
  try {
    // 1. Verificar si hay partidos activos (en vivo o por comenzar en las próximas 2h)
    const now = new Date()
    const futureWindow = new Date(now.getTime() + LIVE_WINDOW_MS)

    const activeMatch = await prisma.match.findFirst({
      where: {
        AND: [
          { OR: [{ homeTeam: { not: 'TBD' } }, { awayTeam: { not: 'TBD' } }] },
          {
            OR: [
              { status: 'LIVE' },
              {
                status: 'PENDING',
                matchDate: { gte: now, lte: futureWindow },
              },
            ],
          },
        ],
      },
      select: { id: true, lastSyncAt: true },
    })

    if (!activeMatch) {
      // No hay partidos activos, no es necesario sincronizar
      return
    }

    // 2. Verificar si han pasado más de 5 min desde la última sync
    if (activeMatch.lastSyncAt) {
      const lastSync = activeMatch.lastSyncAt.getTime()
      if (now.getTime() - lastSync < SYNC_INTERVAL_MS) {
        // Ya se sincronizó recientemente
        return
      }
    }

    // 3. Disparar la sincronización en background (fire-and-forget)
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.NEXTAUTH_URL ||
      `http://localhost:${process.env.PORT || 3000}`

    // Hacemos la llamada sin esperar la respuesta
    // Usamos una Promise que no se rechaza (no rompe la página si falla)
    fetch(`${baseUrl}/api/sync/results`, {
      method: 'GET',
      headers: { 'x-lazy-sync': '1' },
    }).catch(() => {
      // Silenciar errores - es fire-and-forget
    })
  } catch {
    // Silenciar errores - no debe romper la página
  }
}

/**
 * Hook para llamar en Server Components. Se ejecuta en el servidor
 * antes de renderizar la página, sin esperar la respuesta del sync.
 */
export function withLazySync<T>(callback: () => Promise<T>): () => Promise<T> {
  return async () => {
    // Disparar sync en paralelo sin esperar
    maybeLazySyncResults().catch(() => {})
    return callback()
  }
}
