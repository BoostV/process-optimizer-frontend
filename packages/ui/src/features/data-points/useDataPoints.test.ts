import { formatScore } from './useDataPoints'

describe('useDataPoints', () => {
  describe('formatScore', () => {
    it('should return score with correct format', () => {
      expect(formatScore(0.4)).toEqual('0.4')
      expect(formatScore('0.40')).toEqual('0.40')
      expect(formatScore(4)).toEqual('4.0')
      expect(formatScore(4.0)).toEqual('4.0')
      expect(formatScore('4.00')).toEqual('4.00')
      expect(formatScore(4.001)).toEqual('4.001')
      expect(formatScore(4000)).toEqual('4000.0')
      expect(formatScore(4000.0)).toEqual('4000.0')
      expect(formatScore('4000.00')).toEqual('4000.00')
    })
  })
})
