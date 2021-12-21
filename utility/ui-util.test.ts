import { initialState, State, UISizeValue } from "../reducers/global-reducer"
import { getSize, isUIBig, isUISmall } from "./ui-util"

const globalStateDummy: State = { ...initialState, uiSizes: [
    { key: 'result-data', value: UISizeValue.Big },
    { key: 'plots', value: UISizeValue.Small }
  ] 
}

describe("ui-util", () => {
  describe("isUIBig", () => {
    it("should return true when UI value is big", async () => {
      expect(isUIBig(globalStateDummy, 'result-data')).toBeTruthy()
    })
    it("should return false when UI value is small", async () => {
      expect(isUIBig(globalStateDummy, 'plots')).toBeFalsy()
    })
  })

  describe("isUISmall", () => {
    it("should return true when UI value is small", async () => {
      expect(isUISmall(globalStateDummy, 'plots')).toBeTruthy()
    })
    it("should return false when UI value is big", async () => {
      expect(isUISmall(globalStateDummy, 'result-data')).toBeFalsy()
    })
  })

  describe("getSize", () => {
    it("should return correct size when key exists", async () => {
      expect(getSize(globalStateDummy, 'result-data')).toBe(UISizeValue.Big)
    })
    it("should return small size when size when key does not exist", async () => {
      expect(getSize({ ...globalStateDummy, uiSizes: [] }, 'plots')).toBe(UISizeValue.Small)
    })
  })
})