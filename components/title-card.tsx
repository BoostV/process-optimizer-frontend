import { Box, Card, CardContent, Typography } from "@material-ui/core"
import useStyles from "../styles/title-card.style"

type TitleCardProps = {
  title: string
  children: any
}

export default function TitleCard(props: TitleCardProps) {
  const { title, children } = props
  const classes = useStyles()

  return (
    <Card>
      <CardContent className={classes.content}>
        <Box className={classes.title}>
          <Typography variant="h6">
            {title}
          </Typography>
        </Box>
        <Box p={2}>
          {children}
        </Box>
      </CardContent>
    </Card>
  )
}