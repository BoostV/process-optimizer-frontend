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
    fireEvent.change(screen.getByLabelText('weight'), {
      target: { value: '7' },
    })
    fireEvent.change(screen.getByLabelText('viscosity'), {
      target: { value: '15' },
    })
    expect(screen.getByTestId('playground-result').textContent).toContain(
      '33.5'
    )
  })
})
