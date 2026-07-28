import {
  Box,
  Tab,
  Tabs,
  Button,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material'
import StarIcon from '@mui/icons-material/Star'
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined'
import { useMemo, useRef, useState } from 'react'
import { InfoBox } from '@ui/features/core'
import { parse } from 'mathjs'
import {
  useExperiment,
  deriveSymbol,
  usedSymbols,
  scoreNames,
  countDataPointsMissingResponses,
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

  // Per-objective intent for what Save should do to existing data points.
  type BulkIntent = 'unchanged' | 'enable' | 'disable'
  const [bulkIntents, setBulkIntents] = useState<Record<string, BulkIntent>>({})
  const activeIntent: BulkIntent =
    (activeScore && bulkIntents[activeScore.name]) ?? 'unchanged'

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
  const [helpOpen, setHelpOpen] = useState(false)

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

  // Warning reflects the DRAFT function (what Save will persist + apply).
  const missingCount = useMemo(
    () =>
      activeScore !== undefined
        ? countDataPointsMissingResponses(
            experiment.dataPoints,
            activeScore.name,
            drafts[activeScore.name]
          )
        : 0,
    [experiment.dataPoints, activeScore, drafts]
  )
  // A usable function draft is required to enable/disable for existing data points.
  const canBulkApply =
    activeScore !== undefined &&
    !expressionError &&
    (drafts[activeScore.name]?.expression.trim() ?? '') !== ''

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
    // Persisting the function first means setDataPointsUseFunction recomputes
    // against the just-saved function.
    enabledScores.forEach(sv => {
      const intent = bulkIntents[sv.name]
      if (intent === 'enable' || intent === 'disable') {
        dispatch({
          type: 'setDataPointsUseFunction',
          payload: { scoreName: sv.name, useFunction: intent === 'enable' },
        })
      }
    })
    onSave()
  }

  return (
    <Box className={classes.main}>
      <Box className={classes.header}>
        <StarIcon fontSize="small" />
        Score functions
      </Box>
      <Dialog
        open={helpOpen}
        onClose={() => setHelpOpen(false)}
        aria-labelledby="score-function-help-title"
        maxWidth="sm"
      >
        <DialogTitle id="score-function-help-title">
          How score functions work
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            A score function computes an objective&apos;s score (e.g. quality or
            cost) for each data point from a formula you define, instead of you
            typing the score by hand.
          </Typography>
          <Typography sx={{ mb: 2 }}>
            The formula is a math expression over two kinds of variables:
          </Typography>
          <Typography component="ul" sx={{ pl: 3, mb: 2 }}>
            <li>
              <strong>Factors</strong> — your experiment&apos;s input variables.
              Click a factor button to insert it; its value is read from each
              data point automatically.
            </li>
            <li>
              <strong>Responses</strong> — extra measured values that
              aren&apos;t inputs. Add them with &quot;+ Add response&quot;, then
              enter their value per data point in the table.
            </li>
          </Typography>
          <Typography sx={{ mb: 2 }}>
            Build the expression by clicking the variable buttons (or typing),
            using <code>+ - * /</code>, parentheses and common math functions.
            The playground lets you try sample values before saving.
          </Typography>
          <Typography sx={{ mb: 2 }}>
            Per data point you can toggle <strong>f(x)</strong> to use the
            computed value, or switch it off to type a value manually. Quality
            scores should map to the given scale.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHelpOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
      <Tabs
        value={tabIndex}
        onChange={(_, v) => {
          setTabIndex(v)
          setShowExpressionError(false)
        }}
        aria-label="score functions"
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        {enabledScores.map(sv => (
          <Tab key={sv.name} label={sv.label} />
        ))}
      </Tabs>
      <Box className={classes.tabContainer}>
        <Box className={classes.tabContainers}>
          <Box className={classes.functionContainer}>
            {activeScore?.name === scoreNames[0] && (
              <InfoBox
                text="Your function should map to the scale 0 - 5."
                type="info"
                margin="8px 0 8px 0"
              />
            )}
            <Box className={classes.function}>
              <Tooltip title="Help" disableInteractive>
                <IconButton
                  size="small"
                  aria-label="score function help"
                  onClick={() => setHelpOpen(true)}
                >
                  <HelpOutlineOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              {/* minWidth:0 lets this flex item shrink below the expression's
                  content width so a long expression wraps instead of
                  overflowing the column into the playground beside it. */}
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <ScoreFunctionField
                  ref={fieldRef}
                  value={draft?.expression ?? ''}
                  symbols={symbols}
                  onChange={next => {
                    setShowExpressionError(false)
                    setDraft(d => {
                      // Auto-register a factor when the user types its name
                      // (matching a known factor's symbol), so it highlights and
                      // shows in the playground without needing the button.
                      const known = new Set(d.variables.map(v => v.symbol))
                      const used = usedSymbols(next)
                      const autoFactors = numericFactors
                        .map(f => ({
                          name: f.name,
                          symbol: deriveSymbol(f.name, []),
                          source: 'factor' as const,
                          factorName: f.name,
                        }))
                        .filter(
                          v => used.includes(v.symbol) && !known.has(v.symbol)
                        )
                      return {
                        ...d,
                        expression: next,
                        variables: [...d.variables, ...autoFactors],
                      }
                    })
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
                  sx={{ boxShadow: 'none', textTransform: 'none' }}
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
                  sx={{ backgroundColor: 'white', textTransform: 'none' }}
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
            <Box className={classes.title}>Test your function</Box>
            <ScoreFunctionPlayground scoreFunction={draft} />
          </Box>
        </Box>

        <Box className={classes.bulkContainer}>
          <Box className={classes.title}>For existing data points</Box>
          <ToggleButtonGroup
            exclusive
            size="small"
            className={classes.bulkToggle}
            value={activeIntent}
            onChange={(_e, value: BulkIntent | null) => {
              if (value !== null && activeScore !== undefined) {
                setBulkIntents(prev => ({
                  ...prev,
                  [activeScore.name]: value,
                }))
              }
            }}
            aria-label="apply score function to existing data points"
          >
            <ToggleButton value="unchanged">Leave unchanged</ToggleButton>
            <ToggleButton value="enable" disabled={!canBulkApply}>
              Use for all
            </ToggleButton>
            <ToggleButton value="disable" disabled={!canBulkApply}>
              Turn off for all
            </ToggleButton>
          </ToggleButtonGroup>
          {activeIntent === 'enable' && missingCount > 0 && (
            <InfoBox
              type="warning"
              margin="8px 0 0 0"
              text={`${missingCount} of ${experiment.dataPoints.length} points are missing responses and will be marked invalid. Adding responses after saving will make them valid again.`}
            />
          )}
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
