import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material'

type CreateOrOverwriteDialogProps = {
  handleCancel: () => void
  handleOverwrite: () => void
  handleCreate: () => void
  open: boolean
}

export const CreateOrOverwriteDialog = (
  props: CreateOrOverwriteDialogProps
) => {
  return (
    <Dialog
      open={props.open}
      onClose={props.handleCancel}
      aria-labelledby="create-or-overwrite-dialog-title"
      aria-describedby="create-or-overwrite-dialog-description"
    >
      <DialogTitle id="create-or-overwrite-dialog-title">
        Experiment with the same id already exists.
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="create-or-overwrite-dialog-description">
          Do you want to overwrite the existing experiment or create a new one?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={props.handleCancel} color="secondary">
          Cancel
        </Button>
        <Button onClick={props.handleOverwrite} color="primary">
          Overwrite
        </Button>
        <Button onClick={props.handleCreate} color="primary" autoFocus>
          Create
        </Button>
      </DialogActions>
    </Dialog>
  )
}
