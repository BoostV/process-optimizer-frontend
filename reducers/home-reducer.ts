export type Action =
  | {
      type: 'addExperimentForDeletion'
      payload: string
    }
  | {
      type: 'resetExperimentsForDeletion'
    }

export type State = {
  experimentsToDelete: string[]
}

export const reducer = (state: State, action: Action) => {
  switch (action.type) {
    case 'addExperimentForDeletion':
      const experimentsToDelete: string[] = state.experimentsToDelete
      let experimentsAfterAdd: string[] = experimentsToDelete.slice()
      experimentsAfterAdd.splice(experimentsToDelete.length, 0, action.payload)
      return { ...state, experimentsToDelete: experimentsAfterAdd }
    case 'resetExperimentsForDeletion':
      return { ...state, experimentsToDelete: [] }
    default:
      return state
  }
}
