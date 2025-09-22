import { Box, Checkbox, IconButton, Tooltip } from '@mui/material'
import { FC, useState } from 'react'
import useStyles from './edit-controls.style'
import { Edit, Delete } from '@mui/icons-material'
import CancelIcon from '@mui/icons-material/Cancel'
import CheckIcon from '@mui/icons-material/Check'

type Props = {
  enabled: boolean
  onEnabledToggled: (enabled: boolean) => void
  onEdit: () => void
  onDelete: () => void
}

export const EditControls: FC<Props> = ({
  enabled,
  onEnabledToggled,
  onEdit,
  onDelete,
}) => {
  const { classes } = useStyles()

  const [isDeleteConfirmVisible, setDeleteConfirmVisible] =
    useState<boolean>(false)
  const [deleteTooltipOpen, setDeleteTooltipOpen] = useState<boolean>(false)

  const handleDelete = () => {
    setDeleteTooltipOpen(false)
    setDeleteConfirmVisible(true)
  }

  const confirmButton = (
    <Tooltip disableInteractive title="Confirm delete">
      <span>
        <IconButton
          size="small"
          aria-label="confirm"
          onClick={() => {
            onDelete()
            setDeleteConfirmVisible(false)
          }}
        >
          <CheckIcon color="primary" fontSize="small" />
        </IconButton>
      </span>
    </Tooltip>
  )

  const cancelButton = (
    <Tooltip disableInteractive title="Cancel delete">
      <span>
        <IconButton
          size="small"
          aria-label="cancel"
          onClick={() => setDeleteConfirmVisible(false)}
          autoFocus
        >
          <CancelIcon color="primary" fontSize="small" />
        </IconButton>
      </span>
    </Tooltip>
  )

  return (
    <Box className={classes.editIconsContainer}>
      <Tooltip disableInteractive title="Edit">
        <span>
          {!isDeleteConfirmVisible && (
            <IconButton size="small" onClick={onEdit}>
              <Edit color={'primary'} fontSize="small" />
            </IconButton>
          )}
        </span>
      </Tooltip>
      <Tooltip
        disableInteractive
        title="Delete"
        open={deleteTooltipOpen && !isDeleteConfirmVisible}
        onOpen={() => setDeleteTooltipOpen(true)}
        onClose={() => setDeleteTooltipOpen(false)}
      >
        <span>
          {!isDeleteConfirmVisible && (
            <IconButton size="small" onClick={handleDelete}>
              <Delete color={'primary'} fontSize="small" />
            </IconButton>
          )}
        </span>
      </Tooltip>
      {isDeleteConfirmVisible && (
        <Box className={classes.confirmContainer}>
          {confirmButton}
          {cancelButton}
        </Box>
      )}
      <Tooltip disableInteractive title="Disable/enable">
        <span>
          {!isDeleteConfirmVisible && (
            <Checkbox
              checked={enabled}
              onChange={(_, checked) => onEnabledToggled(checked)}
              inputProps={{
                'aria-label': 'Enable/disable',
              }}
              size="small"
              color="primary"
            />
          )}
        </span>
      </Tooltip>
    </Box>
  )
}
