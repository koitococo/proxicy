import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

import { cn } from '@/lib/utils'

export function Markdown({ text, className }: { text: string; className?: string }) {
  return (
    <div className={cn('prose prose-neutral max-w-none', className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
    </div>
  )
}
