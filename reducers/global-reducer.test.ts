import { reducer, State } from "./global-reducer"

const initState: State = {
  debug: false,
  useLocalStorage: true,
  experimentsInLocalStorage: []
}

describe("storeExperimentId", () => {
  it("should store id", async () => {
    const payload = '1234'
    expect(reducer(initState, { type: 'storeExperimentId', payload })).toEqual({...initState, experimentsInLocalStorage: [payload]})
  })

  it("should not duplicate id if already stored", async () => {
    const payload = '1234'
    expect(
      reducer({...initState, experimentsInLocalStorage: [payload]}, { type: 'storeExperimentId', payload }))
      .toEqual({...initState, experimentsInLocalStorage: [payload]})
  })
})

describe("deleteExperimentId", () => {
  it("should delete id", async () => {
    expect(
      reducer({...initState, experimentsInLocalStorage: ['1234', '5678'] }, { type: 'deleteExperimentId', payload: '1234' }))
      .toEqual({...initState, experimentsInLocalStorage: ['5678']})
  })
  it("should return empty array when no ids to delete", async () => {
    expect(
      reducer(initState, { type: 'deleteExperimentId', payload: '1234' }))
      .toEqual(initState)
  })
})