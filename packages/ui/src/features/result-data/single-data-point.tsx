import { Fragment, useState } from 'react'
import {
  Typography,
  Box,
  Dialog,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material'
import useStyles from './single-data-point.style'
import {
  OneDPlot,
  OneDData,
  PNGPlot,
} from '@boostv/process-optimizer-frontend-plots'

interface SingleDataPointRow {
  scoreHeader: string
  dataPoint: (number | (string | number)[])[]
  plotData: (string | OneDData)[]
}

interface SingleDataPointProps {
  title?: string
  variableHeaders: string[]
  rows: SingleDataPointRow[]
}

export const SingleDataPoint = ({
  title,
  variableHeaders,
  rows,
}: SingleDataPointProps) => {
  const { classes } = useStyles()
  const columnCount = variableHeaders.length + 1
  const [isDialogOpen, setDialogOpen] = useState(false)
  const [bigPlot, setBigPlot] = useState<string | null>(null)

  return (
    <Box className={classes.container} pb={2}>
      {title && (
        <Typography variant="caption" className={classes.title}>
          {title}
        </Typography>
      )}
      {rows.map((row, rowIndex) => (
        <Fragment key={rowIndex}>
          <Box
            className={classes.grid}
            style={{
              gridTemplateColumns: `repeat(${columnCount}, 1fr)`,
            }}
          >
            {variableHeaders.map((h, idx) => (
              <Box className={classes.cell} key={idx}>
                <Typography variant="body2" fontWeight="bold">
                  {h}
                </Typography>
              </Box>
            ))}
            <Box className={classes.cell}>
              <Typography variant="body2" fontWeight="bold">
                {row.scoreHeader}
              </Typography>
            </Box>
            {row.dataPoint.flat().map((dp, idx) => (
              <Box className={classes.cell} key={'dp' + idx}>
                <Typography variant="body2">{dp}</Typography>
              </Box>
            ))}
            {row.plotData.length > 0 &&
              row.plotData.map((pd, idx) => (
                <Box className={classes.cell} key={'plotData' + idx}>
                  <Box mt={1}>
                    {typeof pd === 'string' ? (
                      <Box
                        onClick={() => {
                          setDialogOpen(true)
                          setBigPlot(pd)
                        }}
                        style={{ cursor: 'pointer' }}
                      >
                        <PNGPlot plot={pd} width={'100%'} maxWidth={160} />
                      </Box>
                    ) : (
                      <OneDPlot
                        data={pd}
                        width={'100%'}
                        height={'140px'}
                        maxWidth={160}
                      />
                    )}
                  </Box>
                </Box>
              ))}
          </Box>
        </Fragment>
      ))}
      <Dialog
        open={isDialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogContent>
          <Box display="flex" justifyContent="center">
            {bigPlot && <PNGPlot plot={bigPlot} width={'100%'} />}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
