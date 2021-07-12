import { Box, Card, CardContent } from "@material-ui/core"
import { ReactNode } from "react"
import useStyles from "../styles/title-card.style"

type TitleCardProps = {
  title: ReactNode
  children: any
}

export const TitleCard = (props: TitleCardProps) => {
  const { title, children } = props
  const classes = useStyles()

  return (
    <Card>
      <CardContent className={classes.content}>
        <Box className={classes.title}>
          {title}
        </Box>
        <Box p={2}>
          {children}
        </Box>
      </CardContent>
    </Card>
  )
}
