import { reducer, State } from "./global-reducer"

describe("storeExperimentId", () => {
  const initState: State = {
    debug: false,
    useLocalStorage: true,
    experimentsInLocalStorage: []
  }

  it("should store id", async () => {
    const payload = '1234'
    expect(reducer(initState, { type: 'storeExperimentId', payload })).toEqual({...initState, experimentsInLocalStorage: [payload]})
  })

  it("should not duplicate id if already stored", async () => {
    const payload = '1234'
    expect(
      reducer({...initState, experimentsInLocalStorage: [payload]}, { type: 'storeExperimentId', payload }))
      .toEqual({...initState, experimentsInLocalStorage: [payload]}
    )
  })
})