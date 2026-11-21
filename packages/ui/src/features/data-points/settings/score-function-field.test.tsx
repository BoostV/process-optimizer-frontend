import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { ScoreFunctionField } from './score-function-field'

afterEach(() => cleanup())

describe('ScoreFunctionField', () => {
  it('renders the current expression text', () => {
    const { container } = render(
      <ScoreFunctionField
        value="weight/2 + viscosity*2"
        symbols={['weight', 'viscosity']}
        onChange={() => {}}
      />
    )
    // The coloured text lives in the highlighted <pre> overlay.
    expect(container.querySelector('pre')).toHaveTextContent('weight')
  })

  it('calls onChange when edited', () => {
    const onChange = vi.fn()
    render(<ScoreFunctionField value="" symbols={[]} onChange={onChange} />)
    const textarea = screen.getByRole('textbox')
    fireEvent.change(textarea, { target: { value: 'weight' } })
    expect(onChange).toHaveBeenCalledWith('weight')
  })
})
