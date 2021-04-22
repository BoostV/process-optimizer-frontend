import { AppBar, Button, Toolbar, Typography } from '@material-ui/core'
import Link from 'next/link'
import useStyles from '../styles/layout.style'
import Image from 'next/image'

export default function Layout ( {children} ) {
  const classes = useStyles()

  return (
    <>
      <AppBar>
        <Toolbar variant="dense">
          <div className={classes.logo}>
            <Image src="/logo.png" alt="logo" width="32" height="32" />
          </div>
          <Typography variant="h6">
            BrownieBee
          </Typography>
          <div className={classes.links}>
            <Link href="/">
              <Button className={classes.link}>
                <a>Home</a>
              </Button>
            </Link>
          </div>
        </Toolbar>
      </AppBar>
      <div className={classes.mainContent}>
        {children}
      </div>
  </>
  )
}