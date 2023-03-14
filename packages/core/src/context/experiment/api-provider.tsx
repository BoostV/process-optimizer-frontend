import React from 'react'
import {
  DefaultApi,
  Configuration,
  ConfigurationParameters,
} from '@boostv/process-optimizer-frontend-api'

export const ApiContext = React.createContext<DefaultApi | undefined>(undefined)

export type ApiProviderProps = {
  children?: React.ReactNode
  client?: DefaultApi
  config?: ConfigurationParameters
}

const defaultConfig: ConfigurationParameters = {}

export const ApiProvider = ({ children, client, config }: ApiProviderProps) => {
  config = config ?? defaultConfig
  return (
    <ApiContext.Provider
      value={
        client ??
        new DefaultApi(new Configuration({ ...defaultConfig, ...config }))
      }
    >
      {children}
    </ApiContext.Provider>
  )
}

export const useApi = () => {
  const context = React.useContext(ApiContext)
  if (context === undefined) {
    throw Error('useApi must be used within a ApiProvider')
  }
  return context
}
