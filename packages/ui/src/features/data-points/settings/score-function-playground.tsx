import { useMemo, useState } from 'react'
import { Box, TextField, Typography } from '@mui/material'
import {
  usedSymbols,
  computeScore,
  type ScoreFunctionType,
} from '@boostv/process-optimizer-frontend-core'

type Props = { scoreFunction: ScoreFunctionType | undefined }

export const ScoreFunctionPlayground = ({ scoreFunction }: Props) => {
  const [inputs, setInputs] = useState<Record<string, string>>({})

  // Only offer test inputs for symbols that are actually declared variables of
  // the function (factors/responses added via the buttons). Bare identifiers a
  // user happens to type into the expression ("a b c") are not variables and
  // must not spawn phantom inputs.
  const symbols = useMemo(
    () =>
      scoreFunction
        ? usedSymbols(scoreFunction.expression).filter(s =>
            scoreFunction.variables.some(v => v.symbol === s)
          )
        : [],
    [scoreFunction]
  )

  if (!scoreFunction || scoreFunction.expression.trim() === '') {
    return (
      <Typography sx={{ fontSize: '0.875rem' }}>
        No function added. Add a function to test it.
      </Typography>
    )
  }

  // Treat every used symbol as a response for the playground (factors are just
  // numbers here). Build response values from the test inputs.
  const testFn: ScoreFunctionType = {
    expression: scoreFunction.expression,
    variables: symbols.map(s => ({
      name: s,
      symbol: s,
      source: 'response' as const,
    })),
  }
  const values = symbols.map(s => ({ symbol: s, value: Number(inputs[s]) }))
  const result = computeScore(testFn, values, [])

  // Label inputs with the variable's human name (e.g. "Pin elevation"), not the
  // mathjs symbol ("pinElevation").
  const nameOf = (s: string) =>
    scoreFunction.variables.find(v => v.symbol === s)?.name ?? s

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 2,
        alignItems: 'flex-end',
        flexWrap: 'wrap',
        marginTop: '-4px',
      }}
    >
      {symbols.map(s => (
        <TextField
          key={s}
          size="small"
          type="number"
          label={nameOf(s)}
          slotProps={{
            htmlInput: { 'aria-label': nameOf(s) },
            inputLabel: { shrink: true },
          }}
          value={inputs[s] ?? ''}
          onChange={e => setInputs(prev => ({ ...prev, [s]: e.target.value }))}
          sx={{ maxWidth: '10rem' }}
        />
      ))}
      <Box>
        <TextField
          key="result"
          size="small"
          label="Result"
          slotProps={{
            htmlInput: { 'aria-label': 'Result', readOnly: true },
            inputLabel: { shrink: true },
          }}
          value={result ?? ''}
          sx={{ maxWidth: '10rem' }}
        />
      </Box>
    </Box>
  )
}
