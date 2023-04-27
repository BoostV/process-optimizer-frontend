import { Box, Checkbox, IconButton, Tooltip } from '@mui/material'
import { FC } from 'react'
import useStyles from './edit-controls.style'
import { Edit, Delete } from '@mui/icons-material'

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

  return (
    <Box className={classes.editIconsContainer}>
      <Tooltip disableInteractive title="Edit">
        <span>
          <IconButton size="small" onClick={onEdit}>
            <Edit color={'primary'} fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip disableInteractive title="Delete">
        <span>
          <IconButton size="small" onClick={onDelete}>
            <Delete color={'primary'} fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip disableInteractive title="Disable/enable">
        <span>
          <Checkbox
            checked={enabled}
            onChange={(_, checked) => onEnabledToggled(checked)}
            inputProps={{
              'aria-label': 'Enable/disable',
            }}
            size="small"
            color="primary"
          />
        </span>
      </Tooltip>
    </Box>
  )
}
