import { forwardRef, useImperativeHandle, useRef } from 'react'

export type HighlightFieldHandle = {
  /** Insert text at the caret (replacing any selection) and keep focus. */
  insertAtCursor: (text: string) => void
}

type Props = {
  value: string
  onChange: (next: string) => void
  onBlur?: () => void
  /**
   * Returns the HTML to render as the coloured layer for `code`.
   * IMPORTANT: the implementation MUST escape any HTML in the input, since the
   * result is injected via dangerouslySetInnerHTML.
   */
  highlight: (code: string) => string
  placeholder?: string
  minHeight?: number
  maxHeight?: number
  paddingRight?: number
  textareaId?: string
  ariaLabel?: string
}

// The transparent <textarea> and the highlighted <pre> must render text
// identically so the coloured layer sits exactly under the caret and the text
// the user types. Both are stacked in the same grid cell.
const sharedText = {
  gridArea: '1 / 1',
  margin: 0,
  border: 0,
  padding: '10px',
  fontFamily: 'monospace',
  fontSize: 16,
  lineHeight: '24px',
  tabSize: 2,
  whiteSpace: 'pre-wrap',
  overflowWrap: 'break-word',
  wordBreak: 'break-word',
  background: 'transparent',
} as const

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/**
 * A lightweight syntax-highlighting text field: a transparent <textarea>
 * overlaid on a highlighted <pre>. Decoupled from any particular language —
 * pass a `highlight` function that returns (escaped) HTML.
 */
export const HighlightField = forwardRef<HighlightFieldHandle, Props>(
  (
    {
      value,
      onChange,
      onBlur,
      highlight,
      placeholder,
      minHeight = 48,
      maxHeight,
      paddingRight,
      textareaId,
      ariaLabel,
    },
    ref
  ) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    useImperativeHandle(ref, () => ({
      insertAtCursor: (text: string) => {
        const ta = textareaRef.current
        const start = ta?.selectionStart ?? value.length
        const end = ta?.selectionEnd ?? value.length
        onChange(value.slice(0, start) + text + value.slice(end))
        // Restore the caret just after the inserted text once React re-renders.
        const restoreCaret = () => {
          const el = textareaRef.current
          if (el !== null) {
            const pos = start + text.length
            el.focus()
            el.setSelectionRange(pos, pos)
          }
        }
        if (typeof requestAnimationFrame === 'function') {
          requestAnimationFrame(restoreCaret)
        }
      },
    }))

    // Empty → show the placeholder greyed out (the textarea's own text is
    // transparent, so its native placeholder wouldn't render reliably). A
    // trailing newline needs an extra line so the two layers stay the same
    // height.
    const html =
      value === ''
        ? `<span style="color:rgba(0,0,0,0.5)">${escapeHtml(
            placeholder ?? ''
          )}</span>`
        : highlight(value) + (value.endsWith('\n') ? '<br/>' : '')

    return (
      <div
        style={{
          display: 'grid',
          position: 'relative',
          minHeight,
          maxHeight,
          overflowY: maxHeight !== undefined ? 'auto' : 'visible',
          overflowX: 'hidden',
          border: '1px solid rgba(0,0,0,0.23)',
          borderRadius: 4,
          boxSizing: 'border-box',
        }}
      >
        <pre
          aria-hidden
          style={{
            ...sharedText,
            ...(paddingRight !== undefined ? { paddingRight } : {}),
            pointerEvents: 'none',
            color: 'rgba(0,0,0,0.87)',
          }}
          dangerouslySetInnerHTML={{ __html: html }}
        />
        <textarea
          ref={textareaRef}
          id={textareaId}
          aria-label={ariaLabel}
          value={value}
          onChange={e => onChange(e.target.value)}
          onBlur={onBlur}
          rows={1}
          spellCheck={false}
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          style={{
            ...sharedText,
            ...(paddingRight !== undefined ? { paddingRight } : {}),
            color: 'transparent',
            caretColor: 'rgba(0,0,0,0.87)',
            WebkitTextFillColor: 'transparent',
            resize: 'none',
            outline: 'none',
            overflow: 'hidden',
          }}
        />
      </div>
    )
  }
)
HighlightField.displayName = 'HighlightField'
