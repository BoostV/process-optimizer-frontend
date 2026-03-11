import {
  Table,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
  Typography,
  Box,
} from '@mui/material'
import useStyles from './single-data-point.style'
import { OneDPlot, OneDData } from '@boostv/process-optimizer-frontend-plots'

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
            {headers.map((h, idx) => (
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
    </Box>
  )
}
