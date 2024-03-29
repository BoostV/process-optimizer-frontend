import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Tooltip,
  Typography,
  Slider,
  CardHeader,
} from '@mui/material'
import { Lens, Settings, PanoramaFishEye } from '@mui/icons-material'
import { useExperiment } from '@boostv/process-optimizer-frontend-core'
import useStyles from './summary-configuration.style'
import { useGlobal } from '@sample/context/global'

export const SummaryConfiguration = () => {
  const {
    state: { experiment },
  } = useExperiment()
  const { dispatch } = useGlobal()
  const { classes } = useStyles()
  return (
    <Card
      onClick={() =>
        dispatch({ type: 'global/setFocus', payload: 'configuration' })
      }
    >
      <CardActionArea>
        <CardContent>
          <CardHeader avatar={<Settings />} title="Configuration" />
          <Divider />
          <Box>
            <Table size="small">
              <TableBody>
                {experiment.valueVariables.map((variable, idx) => (
                  <TableRow key={idx}>
                    <TableCell>
                      {variable.type === 'discrete' ? (
                        <Tooltip disableInteractive title="Discrete">
                          <Lens className={classes.iconDiscrete} />
                        </Tooltip>
                      ) : (
                        <Tooltip disableInteractive title="Continuous">
                          <PanoramaFishEye className={classes.iconDiscrete} />
                        </Tooltip>
                      )}
                    </TableCell>
                    <TableCell component="th" scope="row">
                      {variable.name}
                    </TableCell>
                    <TableCell>
                      [{variable.min}:{variable.max}]
                    </TableCell>
                  </TableRow>
                ))}
                {experiment.categoricalVariables.map((variable, idx) => (
                  <TableRow key={idx}>
                    <TableCell></TableCell>
                    <TableCell component="th" scope="row">
                      {variable.name}
                    </TableCell>
                    <TableCell>{variable.options.join('/')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
          <Divider variant="middle" />
          <Box>
            <Typography gutterBottom variant="overline">
              Explorative
            </Typography>
            <Slider
              disabled
              defaultValue={experiment.optimizerConfig.xi * 100}
              aria-label="Disabled slider"
            />
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  )
}
