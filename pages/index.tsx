import { Box, Card, CardContent, List, ListItem, ListItemText, Typography } from "@material-ui/core";
import { useCallback, useState } from "react";
import { useDropzone } from 'react-dropzone';
import Layout from "../components/layout";
import useStyles from "../styles/home.style";
import { NextRouter, useRouter } from 'next/router'
import SystemUpdateAltIcon from '@material-ui/icons/SystemUpdateAlt';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import { paths } from "../paths";

export default function Home() {
  const classes = useStyles()
  const router: NextRouter = useRouter()
  const [uploadMessage, setUploadMessage] = useState("Drag file here")

  const onDrop = useCallback(acceptedFiles => {
    const reader = new FileReader()
    reader.onabort = () => setUploadMessage('Upload aborted')
    reader.onerror = () => setUploadMessage('Upload failed')
    reader.onprogress = () => setUploadMessage('Loading file...')
    reader.onload = () => {
      const binaryResult: string | ArrayBuffer = reader.result
      try {
        const json: any = JSON.parse(binaryResult as string)
        const id: string = json['id']
        if (id === undefined) {
          setUploadMessage('Id not found')
        } else {
          router.push(`${paths.experiment}/${id}`)
        }
      } catch (e) {
        console.error('File parsing failed', e)
        setUploadMessage('Upload failed')
      }
    }
    reader.readAsText(acceptedFiles[0])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

  return (
    <Layout>
      <Box m={2}>
        <Card className={classes.mainContainer}>
          <CardContent className={classes.mainContent}>

            <Box p={3}>
              <Typography variant="h4">
                Get started
              </Typography>
            </Box>

            <Box p={0} pl={1} mb={1} className={classes.box}>
              <List component="nav">
                <ListItem button>
                  <ListItemText primaryTypographyProps={{ variant: "h6" }} primary="Create new experiment" />
                  <ChevronRightIcon />
                </ListItem>
              </List>
            </Box>

            <Box p={3} pb={1} mb={1} className={classes.box}>
              <Typography variant="h6">
                Upload file with experiment
              </Typography>
              <Box mb={5} className={classes.uploadBox} {...getRootProps()}>
                <SystemUpdateAltIcon className={classes.uploadIcon} />
                <input {...getInputProps()} />
                <div className={classes.uploadBoxInner}>
                  <Typography variant="body1">
                    {uploadMessage}
                  </Typography>
                </div>
              </Box>
            </Box>

            <Box p={3} className={classes.box}>
              <Typography variant="h6">
                Experiments saved in browser
              </Typography>
              <Box mb={1}>
                <List component="nav">
                  <ListItem button>
                    <ListItemText primary="Pandekager (id: 1239812084)" />
                    <ChevronRightIcon />
                  </ListItem>
                  <ListItem button>
                    <ListItemText primary="Chokoladekage (id: 2847247282)" />
                    <ChevronRightIcon />
                  </ListItem>
                  <ListItem button>
                    <ListItemText primary="Secret experiment X (id: 2388853929230)" />
                    <ChevronRightIcon />
                  </ListItem>
                </List>
              </Box>
            </Box>

          </CardContent>
        </Card>
      </Box>
    </Layout>
  );
}