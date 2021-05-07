import { isEmpty } from "./string-util"

describe("isEmpty", () => {
  it("should return true when string only contains whitespace", async () => {
    expect(isEmpty("")).toBeTruthy()
    expect(isEmpty(" ")).toBeTruthy()
  })
  it("should return false when string contains characters", async () => {
    expect(isEmpty("a")).toBeFalsy()
    expect(isEmpty("abc")).toBeFalsy()
  })
})