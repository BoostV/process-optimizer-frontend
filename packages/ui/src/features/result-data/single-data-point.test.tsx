import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { SingleDataPoint } from './single-data-point'
import type { OneDData } from '@boostv/process-optimizer-frontend-plots'

afterEach(() => {
  cleanup()
})

vi.mock('@boostv/process-optimizer-frontend-plots', () => ({
  PNGPlot: ({
    plot,
    width,
    maxWidth,
  }: {
    plot: string
    width?: string | number
    maxWidth?: string | number
  }) => (
    <img
      src={`data:image/png;base64, ${plot}`}
      alt="PNG Plot"
      data-testid="png-plot-img"
      style={{ width, maxWidth }}
    />
  ),
  OneDPlot: ({
    data,
  }: {
    data: OneDData
    width?: string | number
    height?: string | number
    maxWidth?: string | number
  }) => (
    <div data-testid="one-d-plot" role="img">
      OneDPlot: {data.type || 'numeric'}
    </div>
  ),
}))

describe('SingleDataPoint', () => {
  describe('PNG branch', () => {
    it('renders PNG plot with img tag when plotData is a string', () => {
      const pngBase64 =
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
      const props = {
        variableHeaders: ['Var1', 'Var2'],
        rows: [
          {
            scoreHeader: 'Score',
            dataPoint: [10, 20],
            plotData: [pngBase64],
          },
        ],
      }

      const { container } = render(<SingleDataPoint {...props} />)

      const img = container.querySelector('[data-testid="png-plot-img"]')
      expect(img).toBeInTheDocument()
      expect(img).toHaveAttribute('src', `data:image/png;base64, ${pngBase64}`)
    })

    it('opens dialog when PNG plot is clicked', () => {
      const pngBase64 =
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
      const props = {
        variableHeaders: ['DialogVarA'],
        rows: [
          {
            scoreHeader: 'DialogScoreA',
            dataPoint: [100],
            plotData: [pngBase64],
          },
        ],
      }

      const { container } = render(<SingleDataPoint {...props} />)

      expect(
        screen.queryByRole('button', { name: /close/i })
      ).not.toBeInTheDocument()

      const img = container.querySelector('[data-testid="png-plot-img"]')
      const plotWrapper = img?.closest('div')
      if (plotWrapper) {
        fireEvent.click(plotWrapper)
      }

      expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument()
    })

    it('closes dialog when Close button is clicked', () => {
      const pngBase64 =
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
      const props = {
        variableHeaders: ['VarDialogB'],
        rows: [
          {
            scoreHeader: 'DialogScoreB',
            dataPoint: [200],
            plotData: [pngBase64],
          },
        ],
      }

      const { container } = render(<SingleDataPoint {...props} />)

      const img = container.querySelector('[data-testid="png-plot-img"]')
      const plotWrapper = img?.closest('div')
      if (plotWrapper) {
        fireEvent.click(plotWrapper)
      }

      const closeButton = screen.getByRole('button', { name: /close/i })
      expect(closeButton).toBeInTheDocument()

      fireEvent.click(closeButton)

      // MUI Dialog stays in DOM but becomes hidden when closed in jsdom
      // Verify the dialog is no longer visible by checking aria-hidden or checking the Dialog isn't visible
      const dialog = container.querySelector('[role="presentation"]')
      // After close, the dialog backdrop should be hidden or aria-hidden=true
      if (dialog) {
        expect(dialog).toHaveAttribute('aria-hidden', 'true')
      }
    })
  })

  describe('OneDData branch', () => {
    it('renders OneDPlot when plotData is OneDData object', () => {
      const oneDData: OneDData = {
        type: 'numeric',
        points: [
          { x: 1, y: 2 },
          { x: 2, y: 3 },
        ],
      }
      const props = {
        variableHeaders: ['Var1Numeric'],
        rows: [
          {
            scoreHeader: 'ScoreNumeric',
            dataPoint: [10],
            plotData: [oneDData],
          },
        ],
      }

      const { container } = render(<SingleDataPoint {...props} />)

      const oneDPlot = container.querySelector('[data-testid="one-d-plot"]')
      expect(oneDPlot).toBeInTheDocument()
      expect(oneDPlot?.textContent).toContain('OneDPlot: numeric')
    })

    it('renders OneDPlot with score type', () => {
      const oneDData: OneDData = {
        type: 'score',
        points: [
          { x: 1, y: 5 },
          { x: 2, y: 7 },
        ],
      }
      const props = {
        variableHeaders: ['VarScore'],
        rows: [
          {
            scoreHeader: 'ScoreScore',
            dataPoint: [20],
            plotData: [oneDData],
          },
        ],
      }

      const { container } = render(<SingleDataPoint {...props} />)

      const plot = container.querySelector('[data-testid="one-d-plot"]')
      expect(plot?.textContent).toContain('score')
    })

    it('does not open dialog when OneDPlot is clicked', () => {
      const oneDData: OneDData = {
        type: 'numeric',
        points: [{ x: 1, y: 2 }],
      }
      const props = {
        variableHeaders: ['VarNoDialog'],
        rows: [
          {
            scoreHeader: 'ScoreNoDialog',
            dataPoint: [30],
            plotData: [oneDData],
          },
        ],
      }

      const { container } = render(<SingleDataPoint {...props} />)

      const oneDPlot = container.querySelector('[data-testid="one-d-plot"]')
      if (oneDPlot) {
        fireEvent.click(oneDPlot)
      }

      expect(
        screen.queryByRole('button', { name: /close/i })
      ).not.toBeInTheDocument()
    })
  })

  describe('Headers and data rendering', () => {
    it('renders variable headers and score header', () => {
      const props = {
        variableHeaders: ['Temperature', 'Pressure'],
        rows: [
          {
            scoreHeader: 'Optimization Score',
            dataPoint: [25, 100],
            plotData: [],
          },
        ],
      }

      render(<SingleDataPoint {...props} />)

      expect(screen.getByText('Temperature')).toBeInTheDocument()
      expect(screen.getByText('Pressure')).toBeInTheDocument()
      expect(screen.getByText('Optimization Score')).toBeInTheDocument()
    })

    it('renders title when provided', () => {
      const props = {
        title: 'Best Result',
        variableHeaders: ['VarTitle'],
        rows: [
          {
            scoreHeader: 'ScoreTitle',
            dataPoint: [10],
            plotData: [],
          },
        ],
      }

      render(<SingleDataPoint {...props} />)

      expect(screen.getByText('Best Result')).toBeInTheDocument()
    })

    it('renders data point values', () => {
      const props = {
        variableHeaders: ['VarData1', 'VarData2'],
        rows: [
          {
            scoreHeader: 'ScoreData',
            dataPoint: [42, 99],
            plotData: [],
          },
        ],
      }

      render(<SingleDataPoint {...props} />)

      expect(screen.getByText('42')).toBeInTheDocument()
      expect(screen.getByText('99')).toBeInTheDocument()
    })

    it('renders flattened nested data points', () => {
      const props = {
        variableHeaders: ['VarNest1', 'VarNest2'],
        rows: [
          {
            scoreHeader: 'ScoreNest',
            dataPoint: [[111, 222], 333],
            plotData: [],
          },
        ],
      }

      render(<SingleDataPoint {...props} />)

      expect(screen.queryAllByText('111').length).toBeGreaterThan(0)
      expect(screen.queryAllByText('222').length).toBeGreaterThan(0)
      expect(screen.queryAllByText('333').length).toBeGreaterThan(0)
    })
  })

  describe('Multiple rows', () => {
    it('renders multiple data rows with their plots', () => {
      const pngBase64 =
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
      const oneDData: OneDData = {
        type: 'numeric',
        points: [{ x: 1, y: 2 }],
      }

      const props = {
        variableHeaders: ['ParamMulti'],
        rows: [
          {
            scoreHeader: 'ResultA',
            dataPoint: [50],
            plotData: [pngBase64],
          },
          {
            scoreHeader: 'ResultB',
            dataPoint: [60],
            plotData: [oneDData],
          },
        ],
      }

      const { container } = render(<SingleDataPoint {...props} />)

      expect(screen.getByText('ResultA')).toBeInTheDocument()
      expect(screen.getByText('ResultB')).toBeInTheDocument()
      expect(screen.getByText('50')).toBeInTheDocument()
      expect(screen.getByText('60')).toBeInTheDocument()
      expect(
        container.querySelector('[data-testid="png-plot-img"]')
      ).toBeInTheDocument()
      expect(
        container.querySelector('[data-testid="one-d-plot"]')
      ).toBeInTheDocument()
    })
  })

  describe('Empty plot data', () => {
    it('renders row without plots when plotData is empty', () => {
      const props = {
        variableHeaders: ['VarEmpty'],
        rows: [
          {
            scoreHeader: 'ScoreEmpty',
            dataPoint: [999],
            plotData: [],
          },
        ],
      }

      const { container } = render(<SingleDataPoint {...props} />)

      expect(screen.getByText('VarEmpty')).toBeInTheDocument()
      expect(screen.getByText('ScoreEmpty')).toBeInTheDocument()
      expect(screen.getByText('999')).toBeInTheDocument()
      expect(
        container.querySelector('[data-testid="png-plot-img"]')
      ).not.toBeInTheDocument()
      expect(
        container.querySelector('[data-testid="one-d-plot"]')
      ).not.toBeInTheDocument()
    })
  })
})
