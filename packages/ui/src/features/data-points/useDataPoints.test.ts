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

  describe('score function state', () => {
    it('exposes per-objective score function state on rows', () => {
      const { result } = renderHook(() =>
        useDataPoints(
          [
            {
              type: 'discrete',
              name: 'F',
              description: '',
              min: 0,
              max: 10,
              enabled: true,
            },
          ],
          [],
          [
            {
              name: 'quality',
              label: 'Quality (0-5)',
              description: '',
              enabled: true,
              scoreFunction: {
                expression: 'weight*2',
                variables: [
                  { name: 'Weight', symbol: 'weight', source: 'response' },
                ],
              },
            },
          ],
          [
            {
              meta: { id: 1, enabled: true, valid: true },
              data: [
                { type: 'numeric', name: 'F', value: 3 },
                { type: 'score', name: 'quality', value: 4 },
              ],
              responses: [
                {
                  scoreName: 'quality',
                  useFunction: true,
                  values: [{ symbol: 'weight', value: 2 }],
                },
              ],
            },
          ]
        )
      )
      const sf = result.current.state.rows[0]?.scoreFunctions?.find(
        s => s.scoreName === 'quality'
      )
      expect(sf?.useFunction).toBe(true)
      expect(sf?.values.weight).toBe('2')
    })

    it('keeps existing points manual but defaults new points to using the function', () => {
      const { result } = renderHook(() =>
        useDataPoints(
          [
            {
              type: 'discrete',
              name: 'F',
              description: '',
              min: 0,
              max: 10,
              enabled: true,
            },
          ],
          [],
          [
            {
              name: 'quality',
              label: 'Quality (0-5)',
              description: '',
              enabled: true,
              scoreFunction: {
                expression: 'weight*2',
                variables: [
                  { name: 'Weight', symbol: 'weight', source: 'response' },
                ],
              },
            },
          ],
          [
            {
              meta: { id: 1, enabled: true, valid: true },
              data: [
                { type: 'numeric', name: 'F', value: 3 },
                { type: 'score', name: 'quality', value: 4 },
              ],
              // no `responses` entry for this row
            },
          ]
        )
      )
      const rows = result.current.state.rows
      // pre-existing point (no responses) stays manual until the user opts in
      const existing = rows[0]?.scoreFunctions?.find(
        s => s.scoreName === 'quality'
      )
      expect(existing?.hasFunction).toBe(true)
      expect(existing?.useFunction).toBe(false)
      // the new-point template defaults to using the function
      const newRow = rows
        .find(r => r.isNew)
        ?.scoreFunctions?.find(s => s.scoreName === 'quality')
      expect(newRow?.useFunction).toBe(true)
    })
  })

  describe('note', () => {
    it('persists a row note into meta.note on edit', () => {
      const original = [
        { meta: { id: 1, enabled: true, valid: true }, data: [] },
      ]
      const { result } = renderHook(() => useDataPoints([], [], [], original))
      const edited = result.current.editRow(0, {
        isNew: false,
        metaId: 1,
        enabled: true,
        valid: true,
        note: 'measured twice',
        dataPoints: [],
      })
      expect(edited[0]?.meta.note).toBe('measured twice')
    })

    it('clears meta.note when the row note is empty', () => {
      const original = [
        {
          meta: { id: 1, enabled: true, valid: true, note: 'old' },
          data: [],
        },
      ]
      const { result } = renderHook(() => useDataPoints([], [], [], original))
      const edited = result.current.editRow(0, {
        isNew: false,
        metaId: 1,
        enabled: true,
        valid: true,
        note: '',
        dataPoints: [],
      })
      expect(edited[0]?.meta.note).toBeUndefined()
    })

    it('exposes meta.note as row.note when building rows', () => {
      const { result } = renderHook(() =>
        useDataPoints(
          [],
          [],
          [],
          [
            {
              meta: { id: 1, enabled: true, valid: true, note: 'hello' },
              data: [],
            },
          ]
        )
      )
      expect(result.current.state.rows[0]?.note).toBe('hello')
    })
  })
})
