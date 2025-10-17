import { Box, Tooltip, Button } from '@mui/material'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import SettingsIcon from '@mui/icons-material/Settings'
import IconButton from '@mui/material/IconButton'
import { useState } from 'react'
import useStyles from './data-points-settings.style'
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined'
import FormInputText from '@ui/common/forms/form-input'
import { FormProvider, useForm } from 'react-hook-form'
import { InfoBox } from '@ui/features/core'
import { parse } from 'mathjs'
import { FunctionVariables } from '@ui/features/data-points/settings/function-variables'

type DataPointsSettingsProps = {
  tabs: string[]
  onCancel: () => void
  onSave: () => void
}

export function DataPointsSettings(props: DataPointsSettingsProps) {
  const { classes } = useStyles()
  const { tabs, onCancel, onSave } = props

  const methods = useForm<{
    qualityFunction: string
    functionVariables: string[]
    newVariableName: string
    newVariable: string
  }>({
    defaultValues: {
      qualityFunction: '',
      functionVariables: [],
      newVariableName: '',
      newVariable: '',
    },
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
  })

  const [tabIndex, setTabIndex] = useState<number>(0)

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) =>
    setTabIndex(newValue)

  const onSubmit = (data: { qualityFunction: string }) => {
    console.log('submit', data)
    onSave()
  }

  return (
    <Box className={classes.main}>
      <Box className={classes.header}>
        <SettingsIcon fontSize="small" />
        Settings
      </Box>
      <Tabs
        value={tabIndex}
        onChange={handleTabChange}
        aria-label="quality functions"
      >
        {tabs.map((tab, index) => (
          <Tab label={tab} key={index} />
        ))}
      </Tabs>
      <Box className={classes.tabContainer}>
        {tabs.map((_, index) => (
          <Box key={index}>
            <>
              {tabIndex === index && (
                <FormProvider {...methods}>
                  <form onSubmit={methods.handleSubmit(onSubmit)}>
                    <Box>
                      <Box className={classes.tabContainers}>
                        <Box className={classes.functionContainer}>
                          <Box className={classes.function}>
                            <FormInputText
                              name="qualityFunction"
                              control={methods.control}
                              fullWidth
                              margin="dense"
                              label="Quality function"
                              rules={{
                                validate: (expression: string) => {
                                  try {
                                    parse(expression)
                                    return true
                                  } catch (e) {
                                    return `${e}`
                                  }
                                },
                              }}
                            />
                            <Tooltip title="Help" disableInteractive>
                              <IconButton
                                size="small"
                                aria-label="quality function help"
                              >
                                <HelpOutlineOutlinedIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                          <InfoBox
                            text="Function must map to the scale 0-5."
                            type="info"
                            margin="8px 0 8px 0"
                          />
                        </Box>
                        <Box className={classes.functionVariablesContainer}>
                          <FunctionVariables
                            variables={methods.getValues('functionVariables')}
                          />
                        </Box>
                        <Box className={classes.playgroundContainer}>
                          <Box>Playground</Box>
                          <InfoBox
                            text="Test your quality function here."
                            type="info"
                            margin="8px 0 8px 0"
                          />
                        </Box>
                      </Box>
                      <Box className={classes.settingsControls}>
                        <Button size="small" variant="outlined" type="submit">
                          Save
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          type="button"
                          onClick={onCancel}
                        >
                          Cancel
                        </Button>
                      </Box>
                    </Box>
                  </form>
                </FormProvider>
              )}
            </>
          </Box>
        ))}
      </Box>
    </Box>
  )
}
