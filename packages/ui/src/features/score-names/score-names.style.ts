import { SxProps, Theme } from '@mui/material'

export const styles = {
  description: { mb: 2 },
  row: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 2,
    py: 1,
  },
  name: { flex: '1 1 0', minWidth: 0, pt: 0.5, overflowWrap: 'anywhere' },
  nameInput: { flex: '1 1 0', minWidth: 0, maxWidth: 220 },
  // The selected direction is filled: primary colour while editable, grey when
  // read-only.
  toggle: {
    flexShrink: 0,
    '& .MuiToggleButton-root': {
      px: 2,
      py: 0.25,
      fontSize: '0.7rem',
      textTransform: 'none',
    },
    '& .MuiToggleButton-root.Mui-selected': {
      bgcolor: 'primary.main',
      color: 'primary.contrastText',
      '&:hover': { bgcolor: 'primary.dark' },
    },
    '& .MuiToggleButton-root.Mui-selected.Mui-disabled': {
      bgcolor: 'grey.500',
      color: 'common.white',
    },
  },
  actions: { mt: 1.5, display: 'flex', gap: 1 },
} satisfies Record<string, SxProps<Theme>>
