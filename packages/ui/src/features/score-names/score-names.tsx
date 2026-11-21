import {
  Box,
  Button,
  Divider,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material'
import { Edit } from '@mui/icons-material'
import { Fragment, useState } from 'react'
import { TitleCard } from '@ui/features/core/title-card/title-card'
import { styles } from './score-names.style'
import {
  ScoreNameError,
  ScoreNameRow,
  validateScoreNames,
} from './score-names.utils'

export type ScoreNamesTexts = {
  title: string
  description: string
  maximize: string
  minimize: string
  edit: string
  save: string
  cancel: string
  errorEmpty: string
  errorDuplicate: string
  errorReserved: string
}

const defaultTexts: ScoreNamesTexts = {
  title: 'Score names',
  description:
    'Name the score variable and decide whether to maximize or minimize them.',
  maximize: 'Maximize',
  minimize: 'Minimize',
  edit: 'Edit',
  save: 'Save',
  cancel: 'Cancel',
  errorEmpty: 'A score needs a name.',
  errorDuplicate: 'Score names must be different.',
  errorReserved: 'A factor already has this name.',
}

export type ScoreNamesProps = {
  id?: string
  scores: ScoreNameRow[]
  // 'card': a titled card showing the scores read-only; Edit switches to
  //   editing, Save reports the result through onSave, Cancel discards it.
  // 'bare': no card and no buttons, always editable and controlled by
  //   `scores`; every change is reported through onChange. For embedding in
  //   a form such as a "create project" dialog.
  variant?: 'card' | 'bare'
  onSave?: (scores: ScoreNameRow[]) => void
  onChange?: (scores: ScoreNameRow[], valid: boolean) => void
  disabled?: boolean
  texts?: Partial<ScoreNamesTexts>
  // Names a score may not take: the factor names.
  reservedNames?: string[]
}

type RowsProps = {
  rows: ScoreNameRow[]
  editable: boolean
  texts: ScoreNamesTexts
  reservedNames: string[]
  onChangeRow: (index: number, row: ScoreNameRow) => void
}

const ScoreRows = ({
  rows,
  editable,
  texts,
  reservedNames,
  onChangeRow,
}: RowsProps) => {
  const { errors } = validateScoreNames(rows, reservedNames)
  const errorText = (error: ScoreNameError | undefined) =>
    error === 'empty'
      ? texts.errorEmpty
      : error === 'duplicate'
        ? texts.errorDuplicate
        : error === 'reserved'
          ? texts.errorReserved
          : undefined

  return (
    <>
      {rows.map((row, index) => (
        <Fragment key={row.name}>
          {index > 0 && <Divider />}
          <Box sx={styles.row}>
            {editable ? (
              <TextField
                size="small"
                value={row.label}
                onChange={e =>
                  onChangeRow(index, { ...row, label: e.target.value })
                }
                error={errors[row.name] !== undefined}
                helperText={errorText(errors[row.name])}
                sx={styles.nameInput}
                slotProps={{ htmlInput: { 'aria-label': row.name } }}
              />
            ) : (
              <Typography variant="body2" sx={styles.name}>
                {row.label}
              </Typography>
            )}
            <ToggleButtonGroup
              exclusive
              size="small"
              disabled={!editable}
              value={row.maximize ? 'maximize' : 'minimize'}
              // MUI reports null when the selected option is clicked again;
              // one direction must always stay selected.
              onChange={(_, value: 'maximize' | 'minimize' | null) => {
                if (value !== null) {
                  onChangeRow(index, { ...row, maximize: value === 'maximize' })
                }
              }}
              sx={styles.toggle}
            >
              <ToggleButton value="maximize">{texts.maximize}</ToggleButton>
              <ToggleButton value="minimize">{texts.minimize}</ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Fragment>
      ))}
    </>
  )
}

const replaceRow = (
  rows: ScoreNameRow[],
  index: number,
  row: ScoreNameRow
): ScoreNameRow[] => rows.map((r, i) => (i === index ? row : r))

export const ScoreNames = ({
  id,
  scores,
  variant = 'card',
  onSave,
  onChange,
  disabled = false,
  texts: textOverrides,
  reservedNames = [],
}: ScoreNamesProps) => {
  const texts = { ...defaultTexts, ...textOverrides }
  // Card variant only: the rows being edited, or undefined while read-only.
  const [draft, setDraft] = useState<ScoreNameRow[] | undefined>(undefined)

  if (variant === 'bare') {
    return (
      <Box id={id}>
        <Typography variant="body2" sx={styles.description}>
          {texts.description}
        </Typography>
        <ScoreRows
          rows={scores}
          editable={!disabled}
          texts={texts}
          reservedNames={reservedNames}
          onChangeRow={(index, row) => {
            const next = replaceRow(scores, index, row)
            onChange?.(next, validateScoreNames(next, reservedNames).valid)
          }}
        />
      </Box>
    )
  }

  const isEditing = draft !== undefined && !disabled
  const rows = isEditing ? draft : scores
  const canSave = isEditing && validateScoreNames(draft, reservedNames).valid

  const handleSave = () => {
    if (!isEditing || !canSave) {
      return
    }
    const saved = draft.map(row => ({ ...row, label: row.label.trim() }))
    // Nothing to report when Save is pressed without a change.
    if (JSON.stringify(saved) !== JSON.stringify(scores)) {
      onSave?.(saved)
    }
    setDraft(undefined)
  }

  return (
    <TitleCard id={id} title={texts.title}>
      <Typography variant="body2" sx={styles.description}>
        {texts.description}
      </Typography>
      <ScoreRows
        rows={rows}
        editable={isEditing}
        texts={texts}
        reservedNames={reservedNames}
        onChangeRow={(index, row) => setDraft(replaceRow(rows, index, row))}
      />
      <Box sx={styles.actions}>
        {isEditing ? (
          <>
            <Button
              variant="outlined"
              size="small"
              disabled={!canSave}
              onClick={handleSave}
            >
              {texts.save}
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={() => setDraft(undefined)}
            >
              {texts.cancel}
            </Button>
          </>
        ) : (
          <Button
            variant="outlined"
            size="small"
            startIcon={<Edit fontSize="small" />}
            disabled={disabled}
            onClick={() => setDraft(scores)}
          >
            {texts.edit}
          </Button>
        )}
      </Box>
    </TitleCard>
  )
}
