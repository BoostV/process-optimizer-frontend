import {
  CategoricalVariableType,
  DataEntry,
  DataPointType,
  ExperimentType,
  ScoreVariableType,
  ValueVariableType,
} from '@core/common/types'
import { initialState } from '@core/context'
import {
  calculateSpace,
  calculateData,
  dataPointsToCSV,
  csvToDataPoints,
  calculateConstraints,
  invertScore,
} from './converters'
import { createValueVariable } from '@core/context/experiment/test-utils'
import produce from 'immer'

describe('converters', () => {
  const sampleDataPoints: DataEntry[] = [
    [
      { type: 'numeric', name: 'Sukker', value: 23 },
      { type: 'numeric', name: 'Peber', value: 982 },
      { type: 'numeric', name: 'Hvedemel', value: 632 },
      { type: 'categorical', name: 'Kunde', value: 'Mus' },
      { type: 'score', name: 'score', value: 0.1 },
    ] satisfies DataPointType[],
    [
      { type: 'numeric', name: 'Sukker', value: 15 },
      { type: 'numeric', name: 'Peber', value: 123 },
      { type: 'numeric', name: 'Hvedemel', value: 324 },
      { type: 'categorical', name: 'Kunde', value: 'Ræv' },
      { type: 'score', name: 'score', value: 0.2 },
    ] satisfies DataPointType[],
  ].map((data, idx) => ({
    meta: { enabled: true, id: idx + 1, valid: true },
    data,
  }))
  const sampleMultiObjectiveDataPoints: DataEntry[] = [
    [
      { type: 'numeric', name: 'Sukker', value: 23 },
      { type: 'numeric', name: 'Peber', value: 982 },
      { type: 'numeric', name: 'Hvedemel', value: 632 },
      { type: 'categorical', name: 'Kunde', value: 'Mus' },
      { type: 'score', name: 'score', value: 0.1 },
      { type: 'score', name: 'score2', value: 0.3 },
    ] satisfies DataPointType[],
    [
      { type: 'numeric', name: 'Sukker', value: 15 },
      { type: 'numeric', name: 'Peber', value: 123 },
      { type: 'numeric', name: 'Hvedemel', value: 324 },
      { type: 'categorical', name: 'Kunde', value: 'Ræv' },
      { type: 'score', name: 'score', value: 0.2 },
      { type: 'score', name: 'score2', value: 0.4 },
    ] satisfies DataPointType[],
  ].map((data, idx) => ({
    meta: { enabled: true, id: idx + 1, valid: true },
    data,
  }))
  const dataPointsWithScores: DataEntry[] = [
    [
      { name: 'score', type: 'score', value: 1.7 },
      { name: 'score2', type: 'score', value: 17 },
      { name: 'test', type: 'numeric', value: 1 },
    ] satisfies DataPointType[],
    [
      { name: 'score', type: 'score', value: 2.8 },
      { name: 'score2', type: 'score', value: 18 },
      { name: 'test', type: 'numeric', value: 2 },
    ] satisfies DataPointType[],
    [
      { name: 'score', type: 'score', value: 3.6 },
      { name: 'score2', type: 'score', value: 16 },
      { name: 'test', type: 'numeric', value: 3 },
    ] satisfies DataPointType[],
  ].map((data, idx) => ({
    meta: { enabled: true, id: idx + 1, valid: true },
    data,
  }))
  const sampleExperiment: ExperimentType = {
    ...initialState.experiment,
    id: '123',
    info: {
      ...initialState.experiment.info,
      name: 'Cookies',
      description: "Bager haremus' peberkager",
    },
    categoricalVariables: [
      {
        name: 'Kunde',
        description: '',
        options: ['Mus', 'Ræv'],
        enabled: true,
      },
    ],
    valueVariables: [
      {
        type: 'discrete',
        name: 'Sukker',
        description: '',
        min: 0,
        max: 1000,
        enabled: true,
      },
      {
        type: 'discrete',
        name: 'Peber',
        description: '',
        min: 0,
        max: 1000,
        enabled: true,
      },
      {
        type: 'continuous',
        name: 'Hvedemel',
        description: '',
        min: 0.0,
        max: 1000.8,
        enabled: true,
      },
      {
        type: 'discrete',
        name: 'Mælk',
        description: '',
        min: 1,
        max: 999,
        enabled: true,
      },
    ],
    optimizerConfig: {
      baseEstimator: 'GP',
      acqFunc: 'gp_hedge',
      initialPoints: 2,
      kappa: 1.96,
      xi: 0.012,
    },
  }

  describe('calculateSpace', () => {
    it('should convert space to proper output format', () => {
      const space = calculateSpace(sampleExperiment)
      expect(space).toContainEqual({
        type: 'discrete',
        from: 0,
        name: 'Sukker',
        to: 1000,
      })
      expect(space).toContainEqual({
        type: 'continuous',
        from: 0,
        name: 'Hvedemel',
        to: 1000.8,
      })
    })

    it('should ignore decimal part of discrete variables', () => {
      const experimentWithDiscreteVariablesWithDecimalParts: ExperimentType = {
        ...sampleExperiment,
        valueVariables: [
          {
            type: 'discrete',
            name: 'DiscreteWithDecimal',
            description: '',
            min: 1.2,
            max: 5.4,
            enabled: true,
          },
        ],
      }
      const space = calculateSpace(
        experimentWithDiscreteVariablesWithDecimalParts
      )
      expect(space).toContainEqual({
        type: 'discrete',
        from: 1,
        name: 'DiscreteWithDecimal',
        to: 5,
      })
    })

    it('should retain the correct order of variables', () => {
      const space = calculateSpace(sampleExperiment)
      expect(space[0]?.name).toEqual('Sukker')
      expect(space[1]?.name).toEqual('Peber')
      expect(space[2]?.name).toEqual('Hvedemel')
      expect(space[3]?.name).toEqual('Mælk')
      expect(space[4]?.name).toEqual('Kunde')
    })
  })

  describe('calculateData', () => {
    it('should format data in proper output format', () => {
      const expectedData = [
        { xi: [23, 982, 632, 'Mus'], yi: [0.1] },
        { xi: [15, 123, 324, 'Ræv'], yi: [0] },
      ]
      const actualData = calculateData(
        sampleExperiment.categoricalVariables,
        sampleExperiment.valueVariables,
        sampleExperiment.scoreVariables,
        sampleDataPoints
      )
      expect(actualData).toEqual(expectedData)
    })

    it('should skip disabled data entries', () => {
      const expectedData = [
        { xi: [23, 982, 632, 'Mus'], yi: [0.1] },
        { xi: [15, 123, 324, 'Ræv'], yi: [0] },
      ]
      const actualData = calculateData(
        sampleExperiment.categoricalVariables,
        sampleExperiment.valueVariables,
        sampleExperiment.scoreVariables,
        sampleDataPoints.concat({
          meta: { enabled: false, id: sampleDataPoints.length, valid: true },
          data: sampleDataPoints[0]?.data ?? [],
        })
      )
      expect(actualData).toEqual(expectedData)
    })

    it('should skip invalid data entries', () => {
      const expectedData = [
        { xi: [23, 982, 632, 'Mus'], yi: [0.1] },
        { xi: [15, 123, 324, 'Ræv'], yi: [0] },
      ]
      const actualData = calculateData(
        sampleExperiment.categoricalVariables,
        sampleExperiment.valueVariables,
        sampleExperiment.scoreVariables,
        sampleDataPoints.concat({
          meta: { enabled: true, id: sampleDataPoints.length, valid: false },
          data: sampleDataPoints[0]?.data ?? [],
        })
      )
      expect(actualData).toEqual(expectedData)
    })

    it('should include enabled score values', () => {
      const expectedData = [
        { xi: [23, 982, 632, 'Mus'], yi: [0.1, 0.1] },
        { xi: [15, 123, 324, 'Ræv'], yi: [0, 0] },
      ]
      const actualData = calculateData(
        sampleExperiment.categoricalVariables,
        sampleExperiment.valueVariables,
        [
          { name: 'score', description: '', enabled: true },
          { name: 'score2', description: '', enabled: true },
        ],
        sampleMultiObjectiveDataPoints
      )
      expect(actualData).toEqual(expectedData)
    })

    it('should skip disabled score values', () => {
      const expectedData = [
        { xi: [23, 982, 632, 'Mus'], yi: [0.1] },
        { xi: [15, 123, 324, 'Ræv'], yi: [0] },
      ]
      const actualData = calculateData(
        sampleExperiment.categoricalVariables,
        sampleExperiment.valueVariables,
        [
          { name: 'score', description: '', enabled: true },
          { name: 'score2', description: '', enabled: false },
        ],
        sampleMultiObjectiveDataPoints
      )
      expect(actualData).toEqual(expectedData)
    })

    it('invertScore - for a given score, should return max score with the same name minus score', () => {
      const dataEntries = dataPointsWithScores.map(d => d.data)

      // 'score', max: 3.6, score: 1.7
      const score1 = dataPointsWithScores[0]?.data[0]
      if (score1 === undefined) {
        throw new Error('score 1 undefined')
      }
      const actual1 = invertScore(dataEntries, score1)
      expect(actual1).toEqual(1.9)

      // 'score2', max: 18, score: 16
      const score2 = dataPointsWithScores[0]?.data[2]
      if (score2 === undefined) {
        throw new Error('score 2 undefined')
      }
      const actual2 = invertScore(dataEntries, score2)
      expect(actual2).toEqual(2)
    })
  })

  describe('calculateConstraints', () => {
    it('should convert names to sorted array of indices', () => {
      const experiment = produce(initialState.experiment, draft => {
        draft.valueVariables = ['name1', 'name2', 'name3', 'name4'].map(name =>
          createValueVariable({ name })
        )
        draft.constraints = [
          { type: 'sum', dimensions: ['name3', 'name1'], value: 42 },
        ]
      })
      const actual = calculateConstraints(experiment)
      expect(actual[0]).toMatchObject({
        dimensions: [0, 2],
        type: 'sum',
        value: 42,
      })
    })

    it('should only include enabled variables', () => {
      const experiment = produce(initialState.experiment, draft => {
        draft.valueVariables = ['name1', 'name2', 'name3', 'name4'].map(name =>
          createValueVariable({ name })
        )
        draft.valueVariables.push(
          createValueVariable({ name: 'disabled', enabled: false })
        )
        draft.constraints = [
          {
            type: 'sum',
            dimensions: ['name3', 'name1', 'disabled'],
            value: 42,
          },
        ]
      })
      const actual = calculateConstraints(experiment)
      expect(actual[0]).toMatchObject({
        dimensions: [0, 2],
        type: 'sum',
        value: 42,
      })
    })

    it('should only include continuous variables', () => {
      const experiment = produce(initialState.experiment, draft => {
        draft.valueVariables = ['name1', 'name2', 'name3', 'name4'].map(name =>
          createValueVariable({ name })
        )
        draft.valueVariables.push(
          createValueVariable({ name: 'discrete', type: 'discrete' })
        )
        draft.constraints = [
          {
            type: 'sum',
            dimensions: ['name3', 'name1', 'discrete'],
            value: 42,
          },
        ]
      })
      const actual = calculateConstraints(experiment)
      expect(actual[0]).toMatchObject({
        dimensions: [0, 2],
        type: 'sum',
        value: 42,
      })
    })

    it('should return empty list if resulting dimension is less than 2', () => {
      const experiment = produce(initialState.experiment, draft => {
        draft.valueVariables = ['name1'].map(name =>
          createValueVariable({ name })
        )
        draft.constraints = [
          {
            type: 'sum',
            dimensions: ['name1'],
            value: 42,
          },
        ]
      })
      const actual = calculateConstraints(experiment)
      expect(actual).toHaveLength(0)
    })
  })

  describe('dataPointsToCSV', () => {
    it('should accept empty data set', () => {
      const input: DataEntry[] = []
      const expected = ''
      const actual = dataPointsToCSV(input)
      expect(actual).toEqual(expected)
    })

    it('should convert known value', () => {
      const input: DataEntry[] = [
        {
          meta: {
            enabled: true,
            id: 1,
            valid: true,
          },
          data: [
            {
              type: 'numeric',
              name: 'Sukker',
              value: 28,
            },
            {
              type: 'numeric',
              name: 'Peber',
              value: 982,
            },
            {
              type: 'numeric',
              name: 'Hvedemel',
              value: 632,
            },
            {
              type: 'categorical',
              name: 'Kunde',
              value: 'Mus',
            },
            {
              type: 'score',
              name: 'score',
              value: 1,
            },
          ],
        },
        {
          meta: {
            enabled: false,
            id: 3,
            valid: true,
          },
          data: [
            {
              type: 'numeric',
              name: 'Sukker',
              value: 15,
            },
            {
              type: 'numeric',
              name: 'Peber',
              value: 986,
            },
            {
              type: 'numeric',
              name: 'Hvedemel',
              value: 5,
            },
            {
              type: 'categorical',
              name: 'Kunde',
              value: 'Mus',
            },
            {
              type: 'score',
              name: 'score',
              value: 2,
            },
          ],
        },
      ]
      const expected =
        'id;Sukker;Peber;Hvedemel;Kunde;score;enabled;valid\n1;28;982;632;Mus;1;true;true\n3;15;986;5;Mus;2;false;true'
      const actual = dataPointsToCSV(input)
      expect(actual).toEqual(expected)
    })

    it('should fill missing values', () => {
      const input: DataEntry[] = [
        {
          meta: {
            enabled: true,
            id: 1,
            valid: true,
          },
          data: [
            {
              type: 'numeric',
              name: 'Sukker',
              value: 28,
            },
            {
              type: 'numeric',
              name: 'Hvedemel',
              value: 632,
            },
            {
              type: 'categorical',
              name: 'Kunde',
              value: 'Mus',
            },
            {
              type: 'score',
              name: 'score',
              value: 1,
            },
          ],
        },
        {
          meta: {
            enabled: false,
            id: 3,
            valid: true,
          },
          data: [
            {
              type: 'numeric',
              name: 'Sukker',
              value: 15,
            },
            {
              type: 'numeric',
              name: 'Peber',
              value: 986,
            },
            {
              type: 'numeric',
              name: 'Hvedemel',
              value: 5,
            },
            {
              type: 'categorical',
              name: 'Kunde',
              value: 'Mus',
            },
            {
              type: 'score',
              name: 'score',
              value: 2,
            },
          ],
        },
      ]
      const expected =
        'id;Sukker;Peber;Hvedemel;Kunde;score;enabled;valid\n1;28;;632;Mus;1;true;true\n3;15;986;5;Mus;2;false;true'
      const actual = dataPointsToCSV(input)
      expect(actual).toEqual(expected)
    })

    it('should not sort lines according to meta.id', () => {
      const input: DataEntry[] = [
        {
          meta: {
            enabled: true,
            id: 3,
            valid: true,
          },
          data: [
            {
              type: 'numeric',
              name: 'Sukker',
              value: 282,
            },
            {
              type: 'score',
              name: 'score',
              value: 2,
            },
          ],
        },
        {
          meta: {
            enabled: true,
            id: 1,
            valid: true,
          },
          data: [
            {
              type: 'numeric',
              name: 'Sukker',
              value: 280,
            },
            {
              type: 'score',
              name: 'score',
              value: 0,
            },
          ],
        },
        {
          meta: {
            enabled: true,
            id: 2,
            valid: true,
          },
          data: [
            {
              type: 'numeric',
              name: 'Sukker',
              value: 281,
            },
            {
              type: 'score',
              name: 'score',
              value: 1,
            },
          ],
        },
      ]
      const expected =
        'id;Sukker;score;enabled;valid\n3;282;2;true;true\n1;280;0;true;true\n2;281;1;true;true'
      const actual = dataPointsToCSV(input)
      expect(actual).toEqual(expected)
    })
  })

  describe('csvToDataPoints', () => {
    const categorialVariables: CategoricalVariableType[] = [
      {
        name: 'Kunde',
        description: '',
        options: ['Mus', 'Ræv'],
        enabled: true,
      },
    ]
    const valueVariables: ValueVariableType[] = [
      {
        name: 'Sukker',
        description: '',
        min: 0,
        max: 1000,
        type: 'discrete',
        enabled: true,
      },
      {
        name: 'Peber',
        description: '',
        min: 0,
        max: 1000,
        type: 'continuous',
        enabled: true,
      },
      {
        name: 'Hvedemel',
        description: '',
        min: 0,
        max: 1000,
        type: 'continuous',
        enabled: true,
      },
    ]
    const scoreVariables: ScoreVariableType[] = [
      { name: 'score', description: '', enabled: true },
    ]

    const sampleDataPoints: DataEntry[] = [
      {
        meta: { enabled: true, id: 1, valid: true },
        data: [
          {
            type: 'numeric',
            name: 'Sukker',
            value: 28,
          },
          {
            type: 'numeric',
            name: 'Peber',
            value: 982,
          },
          {
            type: 'numeric',
            name: 'Hvedemel',
            value: 632,
          },
          {
            type: 'categorical',
            name: 'Kunde',
            value: 'Mus',
          },
          {
            type: 'score',
            name: 'score',
            value: 1,
          },
        ],
      },
      {
        meta: { enabled: false, id: 2, valid: true },
        data: [
          {
            type: 'numeric',
            name: 'Sukker',
            value: 15,
          },
          {
            type: 'numeric',
            name: 'Peber',
            value: 986,
          },
          {
            type: 'numeric',
            name: 'Hvedemel',
            value: 5,
          },
          {
            type: 'categorical',
            name: 'Kunde',
            value: 'Mus',
          },
          {
            type: 'score',
            name: 'score',
            value: 2,
          },
        ],
      },
    ]

    it('should accept empty data string', () => {
      const input = ''
      const expected: DataEntry[] = []
      const actual = csvToDataPoints(input, [], [], [])
      expect(actual).toEqual(expected)
    })

    it('should convert known value', () => {
      const input =
        'id;Sukker;Peber;Hvedemel;Kunde;score;enabled;valid\n1;28;982;632;Mus;1;true;true\n2;15;986;5;Mus;2;false;true'
      const expected = sampleDataPoints
      const actual = csvToDataPoints(
        input,
        valueVariables,
        categorialVariables,
        scoreVariables
      )
      expect(actual).toEqual(expected)
    })

    it('should interpret enabled field as case insensitive', () => {
      const inputWithLowerCase =
        'id;Sukker;Peber;Hvedemel;Kunde;score;enabled;valid\n1;28;982;632;Mus;1;true\n2;15;986;5;Mus;2;false;true'
      const inputWithUpperCase =
        'id;Sukker;Peber;Hvedemel;Kunde;score;enabled;valid\n1;28;982;632;Mus;1;TRUE\n2;15;986;5;Mus;2;FALSE;true'
      const inputWithMixedCase =
        'id;Sukker;Peber;Hvedemel;Kunde;score;enabled;valid\n1;28;982;632;Mus;1;True\n2;15;986;5;Mus;2;False;true'
      const expected = sampleDataPoints
      const actual = [
        inputWithLowerCase,
        inputWithUpperCase,
        inputWithMixedCase,
      ].map(input =>
        csvToDataPoints(
          input,
          valueVariables,
          categorialVariables,
          scoreVariables
        )
      )
      expect(actual[0]).toEqual(expected)
      expect(actual[1]).toEqual(expected)
      expect(actual[2]).toEqual(expected)
    })

    it('should use ID column from CSV', () => {
      const input =
        'id;Sukker;Peber;Hvedemel;Kunde;score;enabled\n42;28;982;632;Mus;1;true\n16;15;986;5;Mus;2;false'
      const ids = [42, 16]
      const expected = sampleDataPoints.map((dp, idx) => ({
        ...dp,
        meta: { ...dp.meta, id: ids[idx] },
      }))
      const actual = csvToDataPoints(
        input,
        valueVariables,
        categorialVariables,
        scoreVariables
      )
      expect(actual).toEqual(expected)
    })

    it('should fail if duplicate ids are supplied', () => {
      const input =
        'id;Sukker;Peber;Hvedemel;Kunde;score;enabled\n2;28;982;632;Mus;1;true\n2;15;986;5;Mus;2;false'
      expect(() =>
        csvToDataPoints(
          input,
          valueVariables,
          categorialVariables,
          scoreVariables
        )
      ).toThrowErrorMatchingSnapshot()
    })

    it('should fail if types does not match schema', () => {
      const input =
        'id;Sukker;Peber;Hvedemel;Kunde;score;enabled\n1;fisk;982;632;Mus;1;true\n2;15;986;5;Mus;2;false'
      expect(() =>
        csvToDataPoints(
          input,
          valueVariables,
          categorialVariables,
          scoreVariables
        )
      ).toThrowErrorMatchingSnapshot()
    })

    it('should work with no meta data columns (ID is generated based on line order)', () => {
      const input =
        'Sukker;Peber;Hvedemel;Kunde;score\n28;982;632;Mus;1\n15;986;5;Mus;2'
      const expected = sampleDataPoints.map((dp, idx) => ({
        ...dp,
        meta: { enabled: true, id: idx + 1, valid: true },
      }))
      const actual = csvToDataPoints(
        input,
        valueVariables,
        categorialVariables,
        scoreVariables
      )
      expect(actual).toEqual(expected)
    })

    it('should accept shuffled columns', () => {
      const input =
        'Sukker;score;id;Hvedemel;enabled;Peber;Kunde\n28;1;1;632;true;982;Mus\n15;2;2;5;false;986;Mus'
      const expected = sampleDataPoints
      const actual = csvToDataPoints(
        input,
        valueVariables,
        categorialVariables,
        scoreVariables
      )
      expect(actual).toEqual(expected)
    })

    it('should fail if header is missing', () => {
      const input = 'Sukker;Hvedemel;Kunde;score\n28;632;Mus;1\n15;5;Mus;2'
      expect(() =>
        csvToDataPoints(
          input,
          valueVariables,
          categorialVariables,
          scoreVariables
        )
      ).toThrowErrorMatchingSnapshot()
    })

    it('should not fail if there are extra headers', () => {
      const input =
        'Sukker;Peber;Hvedemel;Halm;Kunde;score\n28;982;632;007;Mus;1\n15;986;5;008;Mus;2'
      const expected = sampleDataPoints.map(d => d.data)
      const actual = csvToDataPoints(
        input,
        valueVariables,
        categorialVariables,
        scoreVariables
      ).map(d => d.data)
      expect(actual).toEqual(expected)
    })

    it('should add extra headers to meta', () => {
      const input =
        'Sukker;Peber;Hvedemel;Halm;Kunde;score;enabled;valid\n28;982;632;008;Mus;1;true;true\n15;986;5;008;Mus;2;false;true'
      const expected = sampleDataPoints.map(d => ({
        ...d,
        meta: { ...d.meta, halm: '008' },
      }))
      const actual = csvToDataPoints(
        input,
        valueVariables,
        categorialVariables,
        scoreVariables
      )
      expect(actual).toEqual(expected)
    })

    it('should parse optional meta data field (description)', () => {
      const input =
        'id;Sukker;Peber;Hvedemel;Kunde;score;enabled;valid;description\n1;28;982;632;Mus;1;true;true;I am a description\n2;15;986;5;Mus;2;false;true;I am also a description'
      const actual = csvToDataPoints(
        input,
        valueVariables,
        categorialVariables,
        scoreVariables
      )
      expect(actual.length).toEqual(2)
      expect(actual[0]?.meta.description).toEqual('I am a description')
      expect(actual[1]?.meta.description).toEqual('I am also a description')
    })
  })
})
