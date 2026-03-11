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
import {
  PNGPlot,
  OneDPlot,
  OneDData,
} from '@boostv/process-optimizer-frontend-plots'
import { useState } from 'react'
import {
  scoreLabels,
  scoreNames,
} from '@boostv/process-optimizer-frontend-core'

interface SingleDataPointProps {
  title?: string
  headers: string[]
  dataPoint: (number | (string | number)[])[]
  plotData: OneDData[]
}

export const SingleDataPoint = ({
  title,
  headers,
  dataPoint,
  plotData,
}: SingleDataPointProps) => {
  const { classes } = useStyles()
  const [isDialogOpen, setDialogOpen] = useState(false)
  const [bigPlot, setBigPlot] = useState<undefined | string>(undefined)

  const handleDialogClose = () => {
    setDialogOpen(false)
    setBigPlot(undefined)
  }

  return (
    <Box className={classes.tableContainer} pb={2}>
      {title && (
        <Typography variant="caption" className={classes.title}>
          {title}
        </Typography>
      )}
      <Table size="small">
        <TableHead>
          <TableRow>
            {headers
              .concat([
                (scoreLabels[0] ?? scoreNames[0]) +
                  ' (95 % credibility interval)',
              ])
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
              <TableCell className={classes.cell} key={'dp' + idx}>
                {dp}
              </TableCell>
            ))}
          </TableRow>
          {/* {plots && plots.length > 0 && (
            <TableRow>
              {plots.map((p, idx) => (
                <TableCell className={classes.cell} key={'plot' + idx}>
                  <Box
                    onClick={() => {
                      setDialogOpen(true)
                      setBigPlot(p)
                    }}
                  >
                    <PNGPlot plot={p} width={'100%'} maxWidth={160} />
                  </Box>
                </TableCell>
              ))}
            </TableRow>
          )} */}
          <TableRow>
            {plotData &&
              plotData.length > 0 &&
              plotData.map((pd, idx) => (
                <TableCell className={classes.cell} key={'plotData' + idx}>
                  <Box mt={1}>
                    <OneDPlot
                      data={pd}
                      width={'100%'}
                      height={'140px'}
                      maxWidth={140}
                    />
                  </Box>
                </TableCell>
              ))}
          </TableRow>
        </TableBody>
      </Table>
      <Dialog onClose={handleDialogClose} open={isDialogOpen}>
        <DialogContent>
          <PNGPlot plot={bigPlot ?? ''} width={400} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
