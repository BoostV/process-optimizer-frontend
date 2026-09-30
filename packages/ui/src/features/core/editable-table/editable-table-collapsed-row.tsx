import useStyles, { disabledCell } from './editable-table-collapsed-row.style'
import {
  Button,
  IconButton,
  TableCell,
  TableRow,
  Tooltip,
  Box,
  Checkbox,
  Popover,
  TextField,
} from '@mui/material'
import { TableDataRow } from './types'
import { EditableTableCell } from './editable-table-cell'
import {
  Add,
  Cancel,
  Check,
  Delete,
  DescriptionOutlined,
  Edit,
} from '@mui/icons-material'
import { useState, type MouseEvent } from 'react'

const NOTE_TOOLTIP_MAX = 100
const truncateNote = (note: string) =>
  note.length > NOTE_TOOLTIP_MAX ? `${note.slice(0, NOTE_TOOLTIP_MAX)}…` : note

interface EditableTableCollapsedRowProps {
  colSpan: number
  rowId: number
  tableRow: TableDataRow
  setExpanded: (expanded: boolean) => void
  onEnabledToggled: (enabled: boolean) => void
  onNoteChanged: (note: string | undefined) => void
  onSelected: (isShiftKeyDown: boolean, isCtrlKeyDown: boolean) => void
  isEditingDisabled?: boolean
  isSelectionExists: boolean
  isSelected: boolean
}

export const EditableTableCollapsedRow = ({
  colSpan,
  rowId,
  tableRow,
  setExpanded,
  onEnabledToggled,
  onNoteChanged,
  onSelected,
  isEditingDisabled,
  isSelected,
  isSelectionExists,
}: EditableTableCollapsedRowProps) => {
  const { classes } = useStyles()
  const rowEnabled = tableRow.enabled && tableRow.valid

  const [noteAnchorEl, setNoteAnchorEl] = useState<HTMLElement | null>(null)
  const [noteDraft, setNoteDraft] = useState('')

  const openNotePopover = (e: MouseEvent<HTMLElement>) => {
    e.stopPropagation()
    setNoteDraft(tableRow.note ?? '')
    setNoteAnchorEl(e.currentTarget)
  }
  const closeNotePopover = () => setNoteAnchorEl(null)
  const saveNote = () => {
    onNoteChanged(noteDraft.trim() === '' ? undefined : noteDraft)
    closeNotePopover()
  }
  const deleteNote = () => {
    onNoteChanged(undefined)
    closeNotePopover()
  }

  return (
    <TableRow
      className={
        tableRow.isNew
          ? classes.rowNew
          : isSelected
            ? classes.rowSelected
            : classes.row
      }
      onClick={e => {
        if (!tableRow.isNew) {
          onSelected(e.shiftKey, e.ctrlKey || e.metaKey)
        }
      }}
    >
      {tableRow.isNew ? (
        <>
          <TableCell className={classes.emptyCell} />
          <TableCell
            align="right"
            colSpan={colSpan}
            className={classes.newRowCell}
          >
            <Box
              sx={{
                m: 1,
              }}
            >
              <Button
                size="small"
                onClick={() => setExpanded(true)}
                disabled={isEditingDisabled || isSelectionExists}
                startIcon={<Add fontSize="small" />}
                variant="outlined"
              >
                Add data point
              </Button>
            </Box>
          </TableCell>
          <TableCell className={classes.emptyCell} />
        </>
      ) : (
        <>
          <TableCell className={classes.emptyCell} />
          <TableCell
            className={classes.cell}
            style={rowEnabled ? {} : disabledCell}
          >
            {rowId}
          </TableCell>
          {tableRow.dataPoints.map((item, itemIndex) => {
            const scoreFunction = tableRow.scoreFunctions?.find(
              sf => sf.scoreName === item.name && sf.hasFunction
            )
            return (
              <EditableTableCell
                key={'editablecell' + itemIndex}
                value={item.value}
                isEditMode={false}
                type={item.type}
                options={item.options}
                tooltip={item.tooltip}
                scoreName={scoreFunction ? item.name : undefined}
                scoreFunction={
                  scoreFunction
                    ? {
                        hasFunction: scoreFunction.hasFunction,
                        useFunction: scoreFunction.useFunction,
                      }
                    : undefined
                }
                style={rowEnabled ? {} : disabledCell}
              />
            )
          })}
          <TableCell className={classes.editCell}>
            <div className={classes.buttonContainer}>
              {tableRow.note !== undefined && tableRow.note !== '' && (
                <>
                  <Tooltip
                    disableInteractive
                    title={truncateNote(tableRow.note)}
                  >
                    <span>
                      <IconButton
                        size="small"
                        data-testid="note-indicator"
                        aria-label={truncateNote(tableRow.note)}
                        onClick={openNotePopover}
                      >
                        <DescriptionOutlined fontSize="small" color="primary" />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Popover
                    open={Boolean(noteAnchorEl)}
                    anchorEl={noteAnchorEl}
                    onClose={closeNotePopover}
                    onClick={e => e.stopPropagation()}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                  >
                    <Box sx={{ p: 1.5, width: '32rem', maxWidth: '90vw' }}>
                      <TextField
                        autoFocus
                        fullWidth
                        variant="standard"
                        value={noteDraft}
                        onChange={e => setNoteDraft(e.target.value)}
                        slotProps={{ htmlInput: { 'aria-label': 'Edit note' } }}
                      />
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'flex-end',
                          gap: 0.5,
                          mt: 1,
                        }}
                      >
                        <Tooltip disableInteractive title="Save">
                          <IconButton
                            size="small"
                            color="primary"
                            aria-label="Save note"
                            onClick={saveNote}
                          >
                            <Check fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip disableInteractive title="Cancel">
                          <IconButton
                            size="small"
                            color="primary"
                            aria-label="Cancel note"
                            onClick={closeNotePopover}
                          >
                            <Cancel fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip disableInteractive title="Delete">
                          <IconButton
                            size="small"
                            color="primary"
                            aria-label="Delete note"
                            onClick={deleteNote}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  </Popover>
                </>
              )}
              <Tooltip disableInteractive title="Edit">
                <span>
                  <IconButton
                    size="small"
                    aria-label="edit"
                    onClick={e => {
                      e.stopPropagation()
                      setExpanded(true)
                    }}
                    disabled={isEditingDisabled}
                  >
                    <Edit
                      fontSize="small"
                      color={isEditingDisabled ? 'disabled' : 'primary'}
                    />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip disableInteractive title="Disable/enable">
                <span>
                  <Checkbox
                    checked={tableRow.enabled}
                    onChange={(_, checked) => {
                      onEnabledToggled(checked)
                    }}
                    onClick={e => e.stopPropagation()}
                    size="small"
                    color="primary"
                    slotProps={{
                      input: {
                        'aria-label': 'Enable/disable',
                      },
                    }}
                  />
                </span>
              </Tooltip>
            </div>
          </TableCell>
          <TableCell className={classes.emptyCell} />
        </>
      )}
    </TableRow>
  )
}
