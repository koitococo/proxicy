import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function removeUndefinedFields<T extends object>(obj: T): T {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v != null)) as T
}

const formatter = new Intl.NumberFormat('zh-CN', {
  style: 'decimal',
  useGrouping: 'min2',
})

export function formatNumber(n: number, forNaN = '-'): string {
  return Number.isNaN(n) ? forNaN : formatter.format(n)
}

export function omit<T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const copy = { ...obj }
  for (const key of keys) {
    delete copy[key]
  }
  return copy
}
