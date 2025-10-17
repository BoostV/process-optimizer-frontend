import {
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material'
import { Delete } from '@mui/icons-material'

export function FunctionVariablesTable() {
  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell></TableCell>
          <TableCell>Weight</TableCell>
          <TableCell>Viscosity</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow>
          <TableCell>Variable</TableCell>
          <TableCell>
            x1
            <IconButton size="small" onClick={() => {}}>
              <Delete color={'primary'} fontSize="small" />
            </IconButton>
          </TableCell>
          <TableCell>
            x2
            <IconButton size="small" onClick={() => {}}>
              <Delete color={'primary'} fontSize="small" />
            </IconButton>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  )
}
