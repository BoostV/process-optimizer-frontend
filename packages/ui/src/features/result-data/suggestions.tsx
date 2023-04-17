import {
  Box,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
} from '@mui/material'
import useStyles from './suggestions.style'
import { MoveDown } from '@mui/icons-material'

interface SuggestionsProps {
  values: string[][]
  headers: string[]
  onCopyToDataPoints?: (index: number) => void
}

export const Suggestions = ({
  values,
  headers,
  onCopyToDataPoints,
}: SuggestionsProps) => {
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
                {onCopyToDataPoints && <TableCell />}
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
                  {onCopyToDataPoints && (
                    <TableCell>
                      <Tooltip
                        disableInteractive
                        title="Transfer to data points"
                      >
                        <IconButton
                          size="small"
                          onClick={() => onCopyToDataPoints(ir)}
                        >
                          <MoveDown fontSize="small" color="primary" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}
    </>
  )
}
