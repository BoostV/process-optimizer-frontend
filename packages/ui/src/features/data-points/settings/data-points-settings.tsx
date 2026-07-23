import { Box, Tab, Tabs, Button, Tooltip, IconButton } from '@mui/material'
import SettingsIcon from '@mui/icons-material/Settings'
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined'
import { useMemo, useRef, useState } from 'react'
import { InfoBox } from '@ui/features/core'
import { parse } from 'mathjs'
import {
  useExperiment,
  deriveSymbol,
  type ScoreFunctionType,
  type ScoreFunctionVariableType,
} from '@boostv/process-optimizer-frontend-core'
import useStyles from './data-points-settings.style'
import {
  ScoreFunctionField,
  type ScoreFunctionFieldHandle,
} from './score-function-field'
import { ScoreFunctionPlayground } from './score-function-playground'

type DataPointsSettingsProps = {
  onCancel: () => void
  onSave: () => void
}

export function DataPointsSettings({
  onCancel,
  onSave,
}: DataPointsSettingsProps) {
  const { classes } = useStyles()
  const {
    state: { experiment },
    dispatch,
  } = useExperiment()
  const [tabIndex, setTabIndex] = useState(0)

  const enabledScores = useMemo(
    () => experiment.scoreVariables.filter(sv => sv.enabled),
    [experiment.scoreVariables]
  )
  const activeScore = enabledScores[tabIndex]

  // Draft function per objective, seeded from the stored one.
  const [drafts, setDrafts] = useState<Record<string, ScoreFunctionType>>(() =>
    Object.fromEntries(
      enabledScores.map(sv => [
        sv.name,
        sv.scoreFunction ?? { expression: '', variables: [] },
      ])
    )
  )
  const draft = activeScore ? drafts[activeScore.name] : undefined
  const fieldRef = useRef<ScoreFunctionFieldHandle>(null)
  const [addingResponse, setAddingResponse] = useState(false)
  const [newResponseName, setNewResponseName] = useState('')
  // Show the parse error only after the user leaves the field (on blur), not on
  // every keystroke while they are mid-expression.
  const [showExpressionError, setShowExpressionError] = useState(false)

  const numericFactors = experiment.valueVariables.filter(v => v.enabled)
  const responseVars =
    draft?.variables.filter(v => v.source === 'response') ?? []

  // Functional updater: composes on the latest draft. Using a plain replacement
  // here would clobber, because registerAndInsert fires two updates in one
  // handler (add the variable, then insert its symbol into the expression) and
  // both would otherwise be built from the same stale `draft` closure — dropping
  // the variable while keeping the symbol in the expression.
  const setDraft = (update: (d: ScoreFunctionType) => ScoreFunctionType) =>
    activeScore &&
    setDrafts(prev => ({
      ...prev,
      [activeScore.name]: update(
        prev[activeScore.name] ?? { expression: '', variables: [] }
      ),
    }))

  const symbols = draft?.variables.map(v => v.symbol) ?? []

  const registerAndInsert = (variable: ScoreFunctionVariableType) => {
    if (!draft) return
    setDraft(d =>
      d.variables.find(v => v.symbol === variable.symbol)
        ? d
        : { ...d, variables: [...d.variables, variable] }
    )
    fieldRef.current?.insertAtCursor(variable.symbol)
  }

  const onClickFactor = (factorName: string) => {
    const existingSymbols = draft?.variables.map(v => v.symbol) ?? []
    const symbol = deriveSymbol(factorName, existingSymbols)
    const already = draft?.variables.find(
      v => v.source === 'factor' && v.factorName === factorName
    )
    registerAndInsert(
      already ?? { name: factorName, symbol, source: 'factor', factorName }
    )
  }

  const onAddResponse = () => {
    if (!draft || newResponseName.trim() === '') return
    setDraft(d => {
      const symbol = deriveSymbol(
        newResponseName,
        d.variables.map(v => v.symbol)
      )
      return {
        ...d,
        variables: [
          ...d.variables,
          { name: newResponseName, symbol, source: 'response' },
        ],
      }
    })
    setNewResponseName('')
    setAddingResponse(false)
  }

  const expressionError = (() => {
    if (!draft || draft.expression.trim() === '') return undefined
    try {
      parse(draft.expression)
      return undefined
    } catch (e) {
      return `${e}`
    }
  })()

  const onSaveClick = () => {
    enabledScores.forEach(sv => {
      const d = drafts[sv.name]
      dispatch({
        type: 'updateScoreFunction',
        payload: {
          scoreName: sv.name,
          scoreFunction: d && d.expression.trim() !== '' ? d : undefined,
        },
      })
    })
    onSave()
  }

  return (
    <Box className={classes.main}>
      <Box className={classes.header}>
        <SettingsIcon fontSize="small" />
        Settings
      </Box>
      <Tabs
        value={tabIndex}
        onChange={(_, v) => {
          setTabIndex(v)
          setShowExpressionError(false)
        }}
        aria-label="score functions"
      >
        {enabledScores.map(sv => (
          <Tab key={sv.name} label={sv.label} />
        ))}
      </Tabs>
      <Box className={classes.tabContainer}>
        <Box className={classes.tabContainers}>
          <Box className={classes.functionContainer}>
            {activeScore?.name === 'quality' && (
              <InfoBox
                text="Your function should map to the scale 0 - 5."
                type="info"
                margin="8px 0 8px 0"
              />
            )}
            <Box
              className={classes.function}
              sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <Tooltip title="Help" disableInteractive>
                <IconButton size="small" aria-label="score function help">
                  <HelpOutlineOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Box sx={{ flexGrow: 1 }}>
                <ScoreFunctionField
                  ref={fieldRef}
                  value={draft?.expression ?? ''}
                  symbols={symbols}
                  onChange={next => {
                    setShowExpressionError(false)
                    setDraft(d => ({ ...d, expression: next }))
                  }}
                  onBlur={() => setShowExpressionError(true)}
                />
              </Box>
            </Box>
            {showExpressionError && expressionError && (
              <InfoBox
                text={expressionError}
                type="warning"
                margin="8px 0 0 0"
              />
            )}

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
              {numericFactors.map(f => (
                <Button
                  key={f.name}
                  size="small"
                  variant="contained"
                  color="primary"
                  // Insert-into-field buttons must not steal focus from the
                  // expression textarea: a blur would fire the on-blur parse
                  // error, whose InfoBox shifts these buttons down between
                  // mousedown and mouseup and cancels the click (so the symbol
                  // never gets inserted). preventDefault keeps focus + cursor.
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => onClickFactor(f.name)}
                >
                  {f.name}
                </Button>
              ))}
            </Box>
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 1,
                mt: 1,
                alignItems: 'center',
              }}
            >
              {responseVars.map(v => (
                <Button
                  key={v.symbol}
                  size="small"
                  variant="outlined"
                  // Keep field focus so the symbol inserts and no blur-error
                  // layout shift cancels the click (see factor buttons above).
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => registerAndInsert(v)}
                >
                  {v.name}
                </Button>
              ))}
              {!addingResponse && (
                <Button size="small" onClick={() => setAddingResponse(true)}>
                  + Add response
                </Button>
              )}
              {addingResponse && (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <input
                    aria-label="response name"
                    placeholder="Name"
                    value={newResponseName}
                    onChange={e => setNewResponseName(e.target.value)}
                  />
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={onAddResponse}
                  >
                    Add
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => setAddingResponse(false)}
                  >
                    Cancel
                  </Button>
                </Box>
              )}
            </Box>
          </Box>

          <Box className={classes.playgroundContainer}>
            <Box>Playground</Box>
            <InfoBox
              text="Test your score function here"
              type="info"
              margin="8px 0 8px 0"
            />
            <ScoreFunctionPlayground scoreFunction={draft} />
          </Box>
        </Box>

        <Box className={classes.settingsControls}>
          <Button
            size="small"
            variant="outlined"
            onClick={onSaveClick}
            disabled={!!expressionError}
          >
            Save
          </Button>
          <Button size="small" variant="outlined" onClick={onCancel}>
            Cancel
          </Button>
        </Box>
      </Box>
    </Box>
  )
}
