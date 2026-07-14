import { ExperimentType } from 'common'
import { produce } from 'immer'
import md5 from 'md5'
import { createFetchExperimentResultRequest } from './api'

export const calculateChangeReducer = produce((state: ExperimentType): void => {
  state.changedSinceLastEvaluation =
    state.lastEvaluationHash !==
    md5(JSON.stringify(createFetchExperimentResultRequest(state)))
})
