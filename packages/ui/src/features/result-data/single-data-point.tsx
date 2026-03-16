import { Fragment } from 'react'
import { Typography, Box } from '@mui/material'
import useStyles from './single-data-point.style'
import { OneDPlot, OneDData } from '@boostv/process-optimizer-frontend-plots'

interface SingleDataPointRow {
  scoreHeader: string
  dataPoint: (number | (string | number)[])[]
  plotData: OneDData[]
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
                    {/* TODO: 1d plots
                    isPNG(plot) ? (
                      <PNGPlot data={plot} />
                    ) : isJSON(plot) : (
                    */}
                    <OneDPlot
                      data={pd}
                      width={'100%'}
                      height={'140px'}
                      maxWidth={160}
                    />
                  </Box>
                </Box>
              ))}
          </Box>
        </Fragment>
      ))}
    </Box>
  )
}
