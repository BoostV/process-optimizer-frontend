import { describe, expect, it } from 'vitest'
import { produce } from 'immer'
import { emptyExperiment } from './store'
import { createFetchExperimentResultRequest } from './api'

const baseExperiment = produce(emptyExperiment, draft => {
  draft.id = 'test-id'
})

describe('createFetchExperimentResultRequest', () => {
  it('omits extras.selectedPoint when no selection is set', () => {
    const req = createFetchExperimentResultRequest(baseExperiment)
    expect('selectedPoint' in (req.experiment?.extras ?? {})).toBe(false)
  })

  it('includes extras.selectedPoint when set', () => {
    const exp = produce(baseExperiment, draft => {
      draft.extras.selectedPoint = [120, 'Vanilla']
    })
    const req = createFetchExperimentResultRequest(exp)
    expect(req.experiment?.extras?.selectedPoint).toEqual([120, 'Vanilla'])
  })

  it('omits extras.pickled when results.pickled is empty', () => {
    const req = createFetchExperimentResultRequest(baseExperiment)
    expect('pickled' in (req.experiment?.extras ?? {})).toBe(false)
  })

  it('includes extras.pickled when results.pickled is non-empty', () => {
    const exp = produce(baseExperiment, draft => {
      draft.results.pickled = 'cached-blob'
    })
    const req = createFetchExperimentResultRequest(exp)
    expect(req.experiment?.extras?.pickled).toBe('cached-blob')
  })
})
