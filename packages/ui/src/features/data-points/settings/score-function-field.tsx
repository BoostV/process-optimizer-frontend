import { forwardRef, useImperativeHandle, useRef } from 'react'
import EditorImport from 'react-simple-code-editor'

// `react-simple-code-editor` is a CommonJS module (`exports.default = Editor`).
// Some bundler interop paths (notably Vite's optimized deps) surface the default
// import wrapped as `{ default: Component }` instead of the component itself,
// which makes React throw "Element type is invalid". Unwrap defensively so it
// works whether the interop hands back the component or the module object.
const Editor =
  (EditorImport as unknown as { default?: typeof EditorImport }).default ??
  EditorImport

export type ScoreFunctionFieldHandle = {
  insertAtCursor: (text: string) => void
}

type Props = {
  value: string
  symbols: string[]
  onChange: (next: string) => void
  onBlur?: () => void
}

// Split an expression into variable/other tokens and wrap recognised symbols in
// a coloured span. Recognised = present in `symbols`. Everything else is plain.
const highlight = (code: string, symbols: string[]): string => {
  const escape = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  return code.replace(/[A-Za-z_][A-Za-z0-9_]*|[^A-Za-z_]+/g, token => {
    if (symbols.includes(token)) {
      return `<span style="color:#1565c0">${escape(token)}</span>`
    }
    return escape(token)
  })
}

export const ScoreFunctionField = forwardRef<ScoreFunctionFieldHandle, Props>(
  ({ value, symbols, onChange, onBlur }, ref) => {
    const lastSelection = useRef<number>(value.length)

    useImperativeHandle(ref, () => ({
      insertAtCursor: (text: string) => {
        const pos = lastSelection.current ?? value.length
        onChange(value.slice(0, pos) + text + value.slice(pos))
      },
    }))

    return (
      <Editor
        value={value}
        onValueChange={onChange}
        highlight={code => highlight(code, symbols)}
        padding={10}
        onKeyUp={e => {
          lastSelection.current =
            (e.target as HTMLTextAreaElement).selectionStart ?? value.length
        }}
        onClick={e => {
          lastSelection.current =
            (e.target as HTMLTextAreaElement).selectionStart ?? value.length
        }}
        onBlur={onBlur}
        textareaId="score-function-input"
        style={{
          fontFamily: 'monospace',
          fontSize: 16,
          border: '1px solid rgba(0,0,0,0.23)',
          borderRadius: 4,
          minHeight: 48,
        }}
      />
    )
  }
)
ScoreFunctionField.displayName = 'ScoreFunctionField'
