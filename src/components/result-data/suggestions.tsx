import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material'
import useStyles from './suggestions.style'
interface SuggestionsProps {
  values: string[][]
  headers: string[]
}

export const Suggestions = ({ values, headers }: SuggestionsProps) => {
  const { classes } = useStyles()

  return (
    <>
      {values[0] !== undefined && values[0].length > 0 && (
        <Box mt={1} className={classes.tableContainer}>
          <Table size="small">
            <TableHead>
              <TableRow>
                {headers.map((h, i) => (
                  <TableCell key={i}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {values.map((row, ir) => (
                <TableRow key={ir}>
                  {row.map((v, iv) => (
                    <TableCell className={classes.cell} key={iv}>
                      {v}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}
    </>
  )
}
