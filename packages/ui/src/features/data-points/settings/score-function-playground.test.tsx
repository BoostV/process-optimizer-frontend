import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { ScoreFunctionPlayground } from './score-function-playground'

afterEach(() => cleanup())

describe('ScoreFunctionPlayground', () => {
  it('shows empty state without a function', () => {
    render(<ScoreFunctionPlayground scoreFunction={undefined} />)
    expect(
      screen.getByText('No function added. Add a function to test it.')
    ).toBeInTheDocument()
  })

  it('does not create inputs for expression symbols that are not declared variables', () => {
    render(
      <ScoreFunctionPlayground
        scoreFunction={{ expression: 'a b c', variables: [] }}
      />
    )
    expect(screen.queryByLabelText('a')).toBeNull()
    expect(screen.queryByLabelText('b')).toBeNull()
    expect(screen.queryByLabelText('c')).toBeNull()
    // still renders the Result field, just no phantom inputs
    expect(screen.getByLabelText('Result')).toBeInTheDocument()
  })

  it('computes a live result from test inputs', () => {
    render(
      <ScoreFunctionPlayground
        scoreFunction={{
          expression: 'weight/2 + viscosity*2',
          variables: [
            { name: 'Weight', symbol: 'weight', source: 'response' },
            { name: 'Viscosity', symbol: 'viscosity', source: 'response' },
          ],
        }}
      />
    )
    fireEvent.change(screen.getByLabelText('Weight'), {
      target: { value: '7' },
    })
    fireEvent.change(screen.getByLabelText('Viscosity'), {
      target: { value: '15' },
    })
    // 7/2 + 15*2 = 33.5, shown in the read-only Result field
    expect(screen.getByDisplayValue('33.5')).toBeInTheDocument()
  })
})
