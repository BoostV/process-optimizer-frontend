import { describe, expect, it } from 'vitest'
import { reducer, State } from './home-reducer'

const initState: State = {
  experimentsToDelete: [],
}

describe('addExperimentForDeletion', () => {
  it('should add experiment', async () => {
    expect(
      reducer(initState, { type: 'addExperimentForDeletion', payload: '1234' })
    ).toEqual({ ...initState, experimentsToDelete: ['1234'] })
  })
})

describe('resetExperimentsForDeletion', () => {
  it('should reset experiments', async () => {
    expect(
      reducer(
        { ...initState, experimentsToDelete: ['1234', '5678'] },
        { type: 'resetExperimentsForDeletion' }
      )
    ).toEqual({ ...initState })
  })
})
