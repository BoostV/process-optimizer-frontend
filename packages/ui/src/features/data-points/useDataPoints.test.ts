import { describe, expect, it } from 'vitest'
import { formatScore, useDataPoints } from './useDataPoints'
import { renderHook } from '@testing-library/react'

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

  describe('deleteRows', () => {
    const original = [
      { meta: { id: 1, enabled: true, valid: true }, data: [] },
      { meta: { id: 2, enabled: true, valid: true }, data: [] },
      { meta: { id: 3, enabled: true, valid: true }, data: [] },
      { meta: { id: 4, enabled: true, valid: true }, data: [] },
    ]

    it('should delete single row', () => {
      const { result } = renderHook(() => useDataPoints([], [], [], original))
      const deleteResult = result.current.deleteRow(1)

      const expected = [
        { meta: { id: 1, enabled: true, valid: true }, data: [] },
        { meta: { id: 3, enabled: true, valid: true }, data: [] },
        { meta: { id: 4, enabled: true, valid: true }, data: [] },
      ]
      expect(deleteResult).toEqual(expected)
    })

    it('should delete multiple rows', () => {
      const { result } = renderHook(() => useDataPoints([], [], [], original))
      const deleteResult = result.current.deleteRows([0, 2])

      const expected = [
        { meta: { id: 2, enabled: true, valid: true }, data: [] },
        { meta: { id: 4, enabled: true, valid: true }, data: [] },
      ]
      expect(deleteResult).toEqual(expected)
    })
  })
})
