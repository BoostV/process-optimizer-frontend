import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  Slider,
} from '@material-ui/core'
import LensIcon from '@material-ui/icons/Lens'
import PanoramaFishEyeIcon from '@material-ui/icons/PanoramaFishEye'
import { useExperiment } from '../../context/experiment-context'
import useStyles from './summary-configuration.style'

export const SummaryConfiguration = () => {
  const {
    state: { experiment },
  } = useExperiment()
  const classes = useStyles()
  return (
    <Card>
      <CardActionArea>
        <CardContent>
          <Typography variant="overline" gutterBottom>
            Configuration
          </Typography>
          <Box>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell></TableCell>
                  <TableCell>Parameters</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {experiment.valueVariables.map((variable, idx) => (
                  <TableRow key={idx}>
                    <TableCell>
                      {variable.type === 'discrete' ? (
                        <Tooltip title="Discrete">
                          <LensIcon className={classes.iconDiscrete} />
                        </Tooltip>
                      ) : (
                        <Tooltip title="Continuous">
                          <PanoramaFishEyeIcon
                            className={classes.iconDiscrete}
                          />
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
