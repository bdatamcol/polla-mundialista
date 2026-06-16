import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  const d = new Date(date)
  // Formato fijo para evitar problemas de hidratación
  const day = d.getDate()
  const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
  const month = months[d.getMonth()]
  return `${day} de ${month} de ${d.getFullYear()}`
}

export function formatDateTime(date: Date | string): string {
  const d = new Date(date)
  const day = d.getDate()
  const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
  const month = months[d.getMonth()]
  const year = d.getFullYear()
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${day} de ${month} de ${year} ${hours}:${minutes}`
}

export function formatTime(date: Date | string): string {
  const d = new Date(date)
  // Formato fijo: HH:MM
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

export function isMatchLocked(matchDate: Date | string, status: string): boolean {
  if (status !== 'PENDING') return true
  const now = new Date()
  const matchTime = new Date(matchDate)
  return now >= matchTime
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}
