import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Typography,
} from '@mui/material'
import useStyles from './loading-experiment.style'
import Layout from '@sample/components/layout/layout'

export function LoadingExperiment() {
  const { classes } = useStyles()
  return (
    <Layout>
      <Card className={classes.loadingContainer}>
        <CardContent>
          <Box mt={8}>
            <CircularProgress disableShrink className={classes.progress} />
            <Typography variant="body2">Loading experiment...</Typography>
          </Box>
        </CardContent>
      </Card>
    </Layout>
  )
}
