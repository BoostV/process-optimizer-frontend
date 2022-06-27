import { render, screen } from '@testing-library/react'
import { useExperiment, TestExperimentProvider } from './experiment-context'

describe('useExperiment', () => {
  it('fails if called outside provider', async () => {
    console.error = jest.fn()
    function ExperimentTester() {
      const context = useExperiment()
      return <>{JSON.stringify(context)}</>
    }
    expect(() => render(<ExperimentTester />)).toThrow(
      'useExperiment must be used within an ExperimentProvider'
    )
    expect(console.error).toHaveBeenCalled()
  })

  it('provides context when called inside provider', async () => {
    function ExperimentTester() {
      const context = useExperiment()
      return <div data-testid="json">{JSON.stringify(context)}</div>
    }
    render(
      <TestExperimentProvider value={{ name: 'test' }}>
        <ExperimentTester />
      </TestExperimentProvider>
    )
    const rawJson = screen.getByTestId('json')
    expect(rawJson.innerHTML).toEqual(JSON.stringify({ name: 'test' }))
  })
})
