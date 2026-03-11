import { Fragment } from 'react'
import {
  Table,
  TableRow,
  TableBody,
  TableCell,
  Typography,
  Box,
} from '@mui/material'
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

  return (
    <Box className={classes.tableContainer} pb={2}>
      {title && (
        <Typography variant="caption" className={classes.title}>
          {title}
        </Typography>
      )}
      <Table size="small">
        <TableBody>
          {rows.map((row, rowIndex) => (
            <Fragment key={rowIndex}>
              <TableRow>
                {variableHeaders.map((h, idx) => (
                  <TableCell className={classes.cell} key={idx}>
                    {h}
                  </TableCell>
                ))}
                <TableCell className={classes.cell}>
                  {row.scoreHeader}
                </TableCell>
              </TableRow>
              <TableRow>
                {row.dataPoint.flat().map((dp, idx) => (
                  <TableCell className={classes.cell} key={'dp' + idx}>
                    {dp}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                {row.plotData.length > 0 &&
                  row.plotData.map((pd, idx) => (
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
            </Fragment>
          ))}
        </TableBody>
      </Table>
    </Box>
  )
}
