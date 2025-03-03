import { treaty } from '@elysiajs/eden'
import type { App } from 'proxicy-ts'

// @ts-expect-error App type is not satisfied
export const api = treaty<App>(import.meta.env.VITE_BASE_URL)
