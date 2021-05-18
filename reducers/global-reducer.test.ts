import { ThemeName } from "../theme/theme"
import { reducer, State } from "./global-reducer"

const initState: State = {
  debug: false,
  useLocalStorage: true,
  experimentsInLocalStorage: [],
  theme: 'BlueGreen',
  dataPointsNewestFirst: false,
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

describe("setTheme", () => {
  it("should set theme", async () => {
    const payload: ThemeName = 'Bee'
    expect(
      reducer(initState, { type: 'setTheme', payload }))
      .toEqual({...initState, theme: payload})
  })
})

describe("setDataPointsNewestFirst", () => {
  it("should toggle data points newest first", async () => {
    const payload = true
    expect(
      reducer(initState, { type: 'setDataPointsNewestFirst', payload }))
      .toEqual({...initState, dataPointsNewestFirst: payload})
  })
})