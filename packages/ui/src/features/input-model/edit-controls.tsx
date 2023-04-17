import { Box, IconButton, Tooltip } from '@mui/material'
import { FC } from 'react'
import useStyles from './edit-controls.style'
import { Edit, Delete } from '@mui/icons-material'

type Props = {
  isAddRemoveDisabled: boolean
  onEdit: () => void
  onDelete: () => void
}

export const EditControls: FC<Props> = ({
  isAddRemoveDisabled,
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
          <IconButton
            size="small"
            disabled={isAddRemoveDisabled}
            onClick={onDelete}
          >
            <Delete
              color={isAddRemoveDisabled ? 'disabled' : 'primary'}
              fontSize="small"
            />
          </IconButton>
        </span>
      </Tooltip>
    </Box>
  )
}
