import { forwardRef } from 'react'
import { HighlightField, type HighlightFieldHandle } from '@ui/common'

export type ScoreFunctionFieldHandle = HighlightFieldHandle

type Props = {
  value: string
  symbols: string[]
  onChange: (next: string) => void
  onBlur?: () => void
}

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

// Wrap recognised symbols (present in `symbols`) in a coloured span; everything
// else is escaped plain text.
const highlightSymbols = (code: string, symbols: string[]): string =>
  code.replace(/[A-Za-z_][A-Za-z0-9_]*|[^A-Za-z_]+/g, token =>
    symbols.includes(token)
      ? `<span style="color:#1565c0">${escapeHtml(token)}</span>`
      : escapeHtml(token)
  )

export const ScoreFunctionField = forwardRef<ScoreFunctionFieldHandle, Props>(
  ({ value, symbols, onChange, onBlur }, ref) => (
    <HighlightField
      ref={ref}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      highlight={code => highlightSymbols(code, symbols)}
      placeholder="Enter function, e.g. a+b*c"
      ariaLabel="score function"
      textareaId="score-function-input"
      minHeight={48}
      // cap growth (~6 lines) and scroll rather than pushing the layout
      maxHeight={164}
    />
  )
)
ScoreFunctionField.displayName = 'ScoreFunctionField'
