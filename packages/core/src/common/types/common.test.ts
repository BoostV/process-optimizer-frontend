import { emptyExperiment } from '@core/context'
import { ExperimentType, isExperiment } from './common'

describe('Type guards', () => {
  it('should not narrow blank object', () => {
    const blank = {}
    const result = isExperiment(blank)
    expect(result).toBeFalsy()
  })

  it('should not narrow object with wrong version in info', () => {
    const minimal = {
      info: {
        dataFormatVersion: '6',
      },
    }
    const result = isExperiment(minimal)
    expect(result).toBeFalsy()
  })

  it('should narrow default empty experiment', () => {
    const defaultExperiment = emptyExperiment
    const result = isExperiment(defaultExperiment)
    expect(result).toBeTruthy()
  })

  it('should narrow type', () => {
    // This test should result in compilation error if narrowing fails
    const defaultExperiment = emptyExperiment
    if (isExperiment(defaultExperiment)) {
      const experiement: ExperimentType = defaultExperiment
      expect(experiement.info.dataFormatVersion !== undefined)
    }
  })
})
