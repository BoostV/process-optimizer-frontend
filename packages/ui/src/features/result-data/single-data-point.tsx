import {
  Table,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
  Typography,
  Box,
  Dialog,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material'
import useStyles from './single-data-point.style'
import { PNGPlot } from '@boostv/process-optimizer-frontend-plots'
import { useState } from 'react'

interface SingleDataPointProps {
  title: string
  headers: string[]
  dataPoint: (number | (string | number)[])[]
  plot: string
}

export const SingleDataPoint = ({
  title,
  headers,
  dataPoint,
  plot,
}: SingleDataPointProps) => {
  const { classes } = useStyles()
  const [isDialogOpen, setDialogOpen] = useState(false)
  const [bigPlot, setBigPlot] = useState<undefined | string>(undefined)

  return (
    <Box className={classes.tableContainer} pb={2}>
      <Typography variant="caption" className={classes.title}>
        {title}
      </Typography>
      <Table size="small">
        <TableHead>
          <TableRow>
            {headers
              .concat(['Score (95 % credibility interval)'])
              .map((h, idx) => (
                <TableCell className={classes.cell} key={idx}>
                  {h}
                </TableCell>
              ))}
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            {dataPoint.flat().map((dp, idx) => (
              <TableCell className={classes.cell} key={idx}>
                {dp}
              </TableCell>
            ))}
          </TableRow>
          <TableRow>
            {dataPoint.flat().map((_, idx) => (
              <TableCell className={classes.cell} key={idx}>
                <Box
                  onClick={() => {
                    setDialogOpen(true)
                    setBigPlot(plot)
                  }}
                >
                  <PNGPlot plot={plot} width={80} />
                </Box>
              </TableCell>
            ))}
          </TableRow>
        </TableBody>
      </Table>
      <Dialog open={isDialogOpen}>
        <DialogContent>
          <PNGPlot plot={bigPlot ?? ''} width={500} />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setDialogOpen(false)
              setBigPlot(undefined)
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
