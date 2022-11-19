import { isJSON, isPNG } from './data-type-detectors'

describe('isJSON', () => {
  it('should return true for an empty object', () => {
    const actual = isJSON('{}')
    expect(actual).toBe(true)
  })

  it('should return false for a PNG', () => {
    const actual = isJSON('iVBORw0KGgo')
    expect(actual).toBe(false)
  })
})

describe('isPNG', () => {
  it('should return true for a PNG', () => {
    const actual = isPNG('iVBORw0KGgo')
    expect(actual).toBe(true)
  })

  it('should return false for another string', () => {
    const actual = isPNG('Hello World')
    expect(actual).toBe(false)
  })
})
