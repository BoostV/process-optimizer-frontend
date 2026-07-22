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

  const symbols = useMemo(
    () => (scoreFunction ? usedSymbols(scoreFunction.expression) : []),
    [scoreFunction]
  )

  if (!scoreFunction || scoreFunction.expression.trim() === '') {
    return (
      <Typography>No function added. Add a function to test it.</Typography>
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

  return (
    <Box
      sx={{ display: 'flex', gap: 2, alignItems: 'flex-end', flexWrap: 'wrap' }}
    >
      {symbols.map(s => (
        <TextField
          key={s}
          size="small"
          type="number"
          label={s}
          slotProps={{ htmlInput: { 'aria-label': s } }}
          value={inputs[s] ?? ''}
          onChange={e => setInputs(prev => ({ ...prev, [s]: e.target.value }))}
        />
      ))}
      <Box>
        <Typography variant="caption">Result</Typography>
        <Typography data-testid="playground-result">
          {result === undefined ? '—' : result}
        </Typography>
      </Box>
    </Box>
  )
}
