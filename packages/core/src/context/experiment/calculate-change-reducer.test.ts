import { describe, expect, it } from 'vitest'
import { ExperimentType } from 'common'
import { calculateChangeReducer } from './calculate-change-reducer'
import { createFetchExperimentResultRequest } from './api'
import { emptyExperiment } from './store'
import md5 from 'md5'

describe('calculateChangeReducer', () => {
  it('should set changedSinceLastEvaluation to false when hash matches', () => {
    const experiment: ExperimentType = {
      ...emptyExperiment,
      id: 'test-id',
    }
    const hash = md5(
      JSON.stringify(createFetchExperimentResultRequest(experiment))
    )
    const experimentWithHash: ExperimentType = {
      ...experiment,
      lastEvaluationHash: hash,
    }

    const result = calculateChangeReducer(experimentWithHash)

    expect(result.changedSinceLastEvaluation).toBe(false)
  })

  it('should set changedSinceLastEvaluation to true when hash does not match', () => {
    const experiment: ExperimentType = {
      ...emptyExperiment,
      id: 'test-id',
      lastEvaluationHash: 'outdated-hash',
    }

    const result = calculateChangeReducer(experiment)

    expect(result.changedSinceLastEvaluation).toBe(true)
  })

  it('should set changedSinceLastEvaluation to true when lastEvaluationHash is empty', () => {
    const experiment: ExperimentType = {
      ...emptyExperiment,
      id: 'test-id',
      lastEvaluationHash: '',
    }

    const result = calculateChangeReducer(experiment)

    expect(result.changedSinceLastEvaluation).toBe(true)
  })

  it('should detect change when optimizer config changes', () => {
    const baseExperiment: ExperimentType = {
      ...emptyExperiment,
      id: 'test-id',
    }
    const hash = md5(
      JSON.stringify(createFetchExperimentResultRequest(baseExperiment))
    )
    const experimentWithHash: ExperimentType = {
      ...baseExperiment,
      lastEvaluationHash: hash,
    }

    expect(
      calculateChangeReducer(experimentWithHash).changedSinceLastEvaluation
    ).toBe(false)

    const modifiedExperiment: ExperimentType = {
      ...experimentWithHash,
      optimizerConfig: {
        ...experimentWithHash.optimizerConfig,
        initialPoints: 10,
      },
    }

    const result = calculateChangeReducer(modifiedExperiment)

    expect(result.changedSinceLastEvaluation).toBe(true)
  })

  it('should detect change when variables are added', () => {
    const baseExperiment: ExperimentType = {
      ...emptyExperiment,
      id: 'test-id',
    }
    const hash = md5(
      JSON.stringify(createFetchExperimentResultRequest(baseExperiment))
    )
    const experimentWithHash: ExperimentType = {
      ...baseExperiment,
      lastEvaluationHash: hash,
    }

    expect(
      calculateChangeReducer(experimentWithHash).changedSinceLastEvaluation
    ).toBe(false)

    const modifiedExperiment: ExperimentType = {
      ...experimentWithHash,
      valueVariables: [
        {
          type: 'continuous',
          name: 'TestVar',
          description: 'Test variable',
          min: 0,
          max: 100,
          enabled: true,
        },
      ],
    }

    const result = calculateChangeReducer(modifiedExperiment)

    expect(result.changedSinceLastEvaluation).toBe(true)
  })

  it('should not mutate the original experiment object', () => {
    const experiment: ExperimentType = {
      ...emptyExperiment,
      id: 'test-id',
      changedSinceLastEvaluation: false,
      lastEvaluationHash: 'some-hash',
    }

    const result = calculateChangeReducer(experiment)

    expect(result).not.toBe(experiment)
    expect(experiment.changedSinceLastEvaluation).toBe(false)
    expect(result.changedSinceLastEvaluation).toBe(true)
  })
})
