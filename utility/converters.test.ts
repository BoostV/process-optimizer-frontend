import { initialState } from '../store'
import {
  CategoricalVariableType,
  DataPointType,
  ExperimentType,
  ScoreVariableType,
  ValueVariableType,
} from '../types/common'
import {
  calculateSpace,
  calculateData,
  dataPointsToCSV,
  csvToDataPoints,
} from './converters'

describe('converters', () => {
  const sampleExperiment: ExperimentType = {
    ...initialState.experiment,
    id: '123',
    info: {
      ...initialState.experiment.info,
      name: 'Cookies',
      description: "Bager haremus' peberkager",
    },
    categoricalVariables: [
      { name: 'Kunde', description: '', options: ['Mus', 'Ræv'] },
    ],
    valueVariables: [
      { type: 'discrete', name: 'Sukker', description: '', min: 0, max: 1000 },
      { type: 'discrete', name: 'Peber', description: '', min: 0, max: 1000 },
      {
        type: 'continuous',
        name: 'Hvedemel',
        description: '',
        min: 0.0,
        max: 1000.8,
      },
      { type: 'discrete', name: 'Mælk', description: '', min: 1, max: 999 },
    ],
    optimizerConfig: {
      baseEstimator: 'GP',
      acqFunc: 'gp_hedge',
      initialPoints: 2,
      kappa: 1.96,
      xi: 0.012,
    },
    dataPoints: [
      [
        { name: 'Sukker', value: 23 },
        { name: 'Peber', value: 982 },
        { name: 'Hvedemel', value: 632 },
        { name: 'Kunde', value: 'Mus' },
        { name: 'score', value: 0.1 },
      ],
      [
        { name: 'Sukker', value: 15 },
        { name: 'Peber', value: 123 },
        { name: 'Hvedemel', value: 324 },
        { name: 'Kunde', value: 'Ræv' },
        { name: 'score', value: 0.2 },
      ],
    ],
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
      expect(space[0].name).toEqual('Sukker')
      expect(space[1].name).toEqual('Peber')
      expect(space[2].name).toEqual('Hvedemel')
      expect(space[3].name).toEqual('Mælk')
      expect(space[4].name).toEqual('Kunde')
    })
  })

  describe('calculateData', () => {
    it('should format data in proper output format', () => {
      const expectedData = [
        { xi: [23, 982, 632, 'Mus'], yi: [0.1] },
        { xi: [15, 123, 324, 'Ræv'], yi: [0.2] },
      ]
      const actualData = calculateData(
        sampleExperiment.categoricalVariables,
        sampleExperiment.valueVariables,
        sampleExperiment.scoreVariables,
        sampleExperiment.dataPoints
      )
      expect(actualData).toEqual(expectedData)
    })
  })

  describe('dataPointsToCSV', () => {
    it('should accept empty data set', () => {
      const input = [[]]
      const expected = ''
      const actual = dataPointsToCSV(input)
      expect(actual).toEqual(expected)
    })

    it('should convert known value', () => {
      const input = [
        [
          {
            name: 'Sukker',
            value: 28,
          },
          {
            name: 'Peber',
            value: 982,
          },
          {
            name: 'Hvedemel',
            value: 632,
          },
          {
            name: 'Kunde',
            value: 'Mus',
          },
          {
            name: 'score',
            value: [1],
          },
        ],
        [
          {
            name: 'Sukker',
            value: '15',
          },
          {
            name: 'Peber',
            value: '986',
          },
          {
            name: 'Hvedemel',
            value: '5',
          },
          {
            name: 'Kunde',
            value: 'Mus',
          },
          {
            name: 'score',
            value: '2',
          },
        ],
      ]
      const expected =
        'Sukker;Peber;Hvedemel;Kunde;score\n28;982;632;Mus;1\n15;986;5;Mus;2'
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
      },
    ]
    const valueVariables: ValueVariableType[] = [
      {
        name: 'Sukker',
        description: '',
        min: 0,
        max: 1000,
        type: 'discrete',
      },
      {
        name: 'Peber',
        description: '',
        min: 0,
        max: 1000,
        type: 'continuous',
      },
      {
        name: 'Hvedemel',
        description: '',
        min: 0,
        max: 1000,
        type: 'continuous',
      },
    ]
    const scoreVariables: ScoreVariableType[] = [
      { name: 'score', description: '', enabled: true },
    ]

    const sampleDataPoints = [
      [
        {
          name: 'Sukker',
          value: 28,
        },
        {
          name: 'Peber',
          value: 982,
        },
        {
          name: 'Hvedemel',
          value: 632,
        },
        {
          name: 'Kunde',
          value: 'Mus',
        },
        {
          name: 'score',
          value: 1,
        },
      ],
      [
        {
          name: 'Sukker',
          value: 15,
        },
        {
          name: 'Peber',
          value: 986,
        },
        {
          name: 'Hvedemel',
          value: 5,
        },
        {
          name: 'Kunde',
          value: 'Mus',
        },
        {
          name: 'score',
          value: 2,
        },
      ],
    ]

    it('should accept empty data string', () => {
      const input = ''
      const expected = [[]]
      const actual = csvToDataPoints(input, [], [], [])
      expect(actual).toEqual(expected)
    })

    it('should convert known value', () => {
      const input =
        'Sukker;Peber;Hvedemel;Kunde;score\n28;982;632;Mus;1\n15;986;5;Mus;2'
      const expected = sampleDataPoints
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
        'Sukker;score;Hvedemel;Peber;Kunde\n28;1;632;982;Mus\n15;2;5;986;Mus'
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
      const expected = sampleDataPoints
      const actual = csvToDataPoints(
        input,
        valueVariables,
        categorialVariables,
        scoreVariables
      )
      expect(actual).toEqual(expected)
    })
  })
})
