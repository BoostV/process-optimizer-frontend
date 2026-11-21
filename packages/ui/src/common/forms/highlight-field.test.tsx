import { describe, it, expect, vi, afterEach } from 'vitest'
import { createRef } from 'react'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { HighlightField, type HighlightFieldHandle } from './highlight-field'

afterEach(() => cleanup())

// highlight that wraps the token "x" in a coloured span, escaping the rest.
const highlight = (code: string) =>
  code.replace(/x|[^x]+/g, t =>
    t === 'x' ? `<span style="color:#1565c0">x</span>` : t
  )

describe('HighlightField', () => {
  it('renders the highlighted overlay for the value', () => {
    const { container } = render(
      <HighlightField value="x+1" onChange={() => {}} highlight={highlight} />
    )
    const pre = container.querySelector('pre')
    expect(pre).toHaveTextContent('x+1')
    // the recognised token is wrapped in a coloured span
    expect(pre?.querySelector('span')).toHaveTextContent('x')
  })

  it('shows the placeholder when empty', () => {
    render(
      <HighlightField
        value=""
        onChange={() => {}}
        highlight={highlight}
        placeholder="type here"
      />
    )
    expect(screen.getByText('type here')).toBeInTheDocument()
  })

  it('calls onChange when edited', () => {
    const onChange = vi.fn()
    render(
      <HighlightField value="" onChange={onChange} highlight={highlight} />
    )
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'x' } })
    expect(onChange).toHaveBeenCalledWith('x')
  })

  it('insertAtCursor splices text at the caret', () => {
    const onChange = vi.fn()
    const ref = createRef<HighlightFieldHandle>()
    render(
      <HighlightField
        ref={ref}
        value="ac"
        onChange={onChange}
        highlight={highlight}
      />
    )
    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement
    textarea.setSelectionRange(1, 1) // caret between a and c
    ref.current?.insertAtCursor('b')
    expect(onChange).toHaveBeenCalledWith('abc')
  })
})
