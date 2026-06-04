import { useState } from 'react'
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
  usePlotColors,
} from '@boostv/process-optimizer-frontend-plots'

interface SingleDataPointRow {
  scoreHeader: string
  // Generic objective name shown as the row's band heading (e.g. "Quality").
  rowLabel?: string
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
  // Shared objective colors (quality / cost) so the two objective rows read as
  // distinct blocks and match the Pareto uncertainty bands exactly.
  const plotColors = usePlotColors()
  const rowTints = [plotColors.row.quality, plotColors.row.cost]
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
        <Box
          key={rowIndex}
          className={classes.rowBand}
          style={{ background: rowTints[rowIndex % rowTints.length] }}
        >
          {row.rowLabel && (
            <Typography variant="subtitle2" className={classes.rowLabel}>
              {row.rowLabel}
            </Typography>
          )}
          <Box
            className={classes.grid}
            style={{
              gridTemplateColumns: `repeat(${columnCount}, 1fr)`,
            }}
          >
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
            {/* Under each plot, on one line: "factor = value" (bold title labels
                the x-axis; value is the reference-line setting). Columns are the
                variable factors followed by the score; a column may carry a title
                without a value. */}
            {[...variableHeaders, row.scoreHeader].map((header, idx) => {
              const value = row.dataPoint.flat()[idx]
              return (
                <Box className={classes.cell} key={'hv' + idx}>
                  <Typography variant="body2">
                    <Box component="span" fontWeight="bold">
                      {header}
                    </Box>
                    {value !== undefined && (
                      <>
                        {' = '}
                        <Box component="span">{value}</Box>
                      </>
                    )}
                  </Typography>
                </Box>
              )
            })}
          </Box>
        </Box>
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
