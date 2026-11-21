import { describe, expect, it } from 'vitest'
import {
  DataEntry,
  ScoreVariableType,
  ValueVariableType,
} from '@core/common/types'
import { csvToDataPoints, dataPointsToCSV, scoreCsvHeaders } from './converters'

const score = (name: 'quality' | 'cost', label: string): ScoreVariableType => ({
  name,
  label,
  description: '',
  enabled: true,
  maximize: name === 'quality',
})

const water: ValueVariableType = {
  type: 'continuous',
  name: 'Water',
  description: '',
  min: 0,
  max: 10,
  enabled: true,
}

const points: DataEntry[] = [
  {
    meta: { id: 1, enabled: true, valid: true },
    data: [
      { type: 'numeric', name: 'Water', value: 5 },
      { type: 'score', name: 'quality', value: 3 },
      { type: 'score', name: 'cost', value: 7 },
    ],
  },
]

describe('scoreCsvHeaders', () => {
  it('uses the trimmed labels', () => {
    expect(
      scoreCsvHeaders([score('quality', ' Yield '), score('cost', 'Waste')], [])
    ).toEqual({ quality: 'Yield', cost: 'Waste' })
  })
  it('falls back to the internal name when the label equals a factor name', () => {
    expect(
      scoreCsvHeaders(
        [score('quality', 'Yield'), score('cost', 'water')],
        ['Water']
      )
    ).toEqual({ quality: 'Yield', cost: 'cost' })
  })
  it('falls back when the label is empty, a meta column, or taken by another score', () => {
    expect(scoreCsvHeaders([score('quality', ' ')], [])).toEqual({
      quality: 'quality',
    })
    expect(scoreCsvHeaders([score('quality', 'Enabled')], [])).toEqual({
      quality: 'quality',
    })
    expect(
      scoreCsvHeaders([score('quality', 'cost'), score('cost', 'Cost')], [])
    ).toEqual({ quality: 'quality', cost: 'Cost' })
    expect(
      scoreCsvHeaders([score('quality', 'Same'), score('cost', 'same')], [])
    ).toEqual({ quality: 'Same', cost: 'cost' })
  })
})

describe('dataPointsToCSV with score labels', () => {
  it('writes the score labels as column headers', () => {
    const csv = dataPointsToCSV(points, ';', '\n', [
      score('quality', 'Yield'),
      score('cost', 'Waste'),
    ])
    expect(csv.split('\n')[0]).toBe('id;Water;Yield;Waste;enabled;valid')
    expect(csv.split('\n')[1]).toBe('1;5;3;7;true;true')
  })
  it('keeps the internal names when no score variables are given (as before)', () => {
    expect(dataPointsToCSV(points).split('\n')[0]).toBe(
      'id;Water;quality;cost;enabled;valid'
    )
  })
  it('keeps the internal name for a score whose label equals a factor name', () => {
    const csv = dataPointsToCSV(points, ';', '\n', [
      score('quality', 'Water'),
      score('cost', 'Waste'),
    ])
    expect(csv.split('\n')[0]).toBe('id;Water;quality;Waste;enabled;valid')
  })
})

describe('csvToDataPoints with score labels', () => {
  const scores = [score('quality', 'Yield'), score('cost', 'Waste')]
  const expected = points

  it('reads a file whose headers are the score labels', () => {
    const csv = 'id;Water;Yield;Waste;enabled;valid\n1;5;3;7;true;true'
    expect(csvToDataPoints(csv, [water], [], scores)).toEqual(expected)
  })
  it('still reads a file whose headers are the internal names', () => {
    const csv = 'id;Water;quality;cost;enabled;valid\n1;5;3;7;true;true'
    expect(csvToDataPoints(csv, [water], [], scores)).toEqual(expected)
  })
  it('reads a mix of label and internal name', () => {
    const csv = 'id;Water;Yield;cost;enabled;valid\n1;5;3;7;true;true'
    expect(csvToDataPoints(csv, [water], [], scores)).toEqual(expected)
  })
  it('round-trips an export', () => {
    const csv = dataPointsToCSV(points, ';', '\n', scores)
    expect(csvToDataPoints(csv, [water], [], scores)).toEqual(expected)
  })
  it('round-trips when a label equals a factor name', () => {
    const clashing = [score('quality', 'Water'), score('cost', 'Waste')]
    const csv = dataPointsToCSV(points, ';', '\n', clashing)
    expect(csvToDataPoints(csv, [water], [], clashing)).toEqual(expected)
  })
  it('names the expected columns when a score column is missing', () => {
    const csv = 'id;Water;Old name;Waste;enabled;valid\n1;5;3;7;true;true'
    expect(() => csvToDataPoints(csv, [water], [], scores)).toThrowError(
      /Water,Yield,Waste/
    )
  })
})
