import { treaty } from '@elysiajs/eden'
import type { App } from 'proxicy-ts'

export const api = treaty<App>(import.meta.env.VITE_BASE_URL)
