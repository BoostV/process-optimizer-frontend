import { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs';
import path from 'path';
import { ExperimentResultType, ExperimentType } from '../../../types/common';
import { emptyExperiment } from '../../../store';
import { Configuration, DefaultApi, OptimizerRunRequest } from '../../../openapi';
import { ExperimentOptimizerConfig } from '../../../openapi/models'

const db = {}

const readFromFile = (file: string) => {
  try {
    const rawData = fs.readFileSync(path.join(file))
    return rawData ? JSON.parse(rawData.toString()) : {}
  } catch {
    return null
  }
}

const writeToFile = (file: string, data: object) => {
  fs.writeFileSync(file, JSON.stringify(data))
}

const runExperiment = async (experiment: ExperimentType) => {
  const API_SERVER = process.env.API_SERVER || 'http://localhost:9090/v1.0'
  const api = new DefaultApi(new Configuration({basePath: API_SERVER, fetchApi: fetch}))
  const cfg = experiment.optimizerConfig
  // TODO data is currently hard coded
  const request: OptimizerRunRequest = {experiment: {
    data: [
      {xi: [1,2], yi: 1},
      {xi: [2,2], yi: 0.2}
    ], 
    optimizerConfig: {
    acqFunc: cfg.acqFunc,
    baseEstimator: cfg.baseEstimator,
    initialPoints: Number(cfg.initialPoints),
    kappa: Number(cfg.kappa),
    xi: Number(cfg.xi),
    space: [
      {from: 1, to: 2},
      {from: 1, to: 2}
    ]
  }}}
  return api.optimizerRun(request)
}

export default async (req: NextApiRequest, res: NextApiResponse<ExperimentType|ExperimentResultType>) => {
  const {
    query: { id },
    method,
    body
  } = req
  const queryId = Array.isArray(id) ? id[0] : id
  if (queryId !== undefined && queryId !== "undefined") {
    const dbFolder = process.env.DB_FOLDER || 'tmp'
    if (!fs.existsSync(dbFolder)) {
      fs.mkdirSync(dbFolder)
    }
    switch (method) {
      case 'GET':
        const store = db[queryId] || readFromFile(path.join(dbFolder, `${queryId}.json`))
        res.json(store || { ...emptyExperiment, id: queryId })
        break
      case 'PUT':
        db[queryId] = JSON.parse(body)
        writeToFile(path.join(dbFolder, `${queryId}.json`), db[queryId])
        res.json(db[queryId])
        break
      case 'POST':
        const experiment = JSON.parse(body)
        const result: ExperimentResultType = { 
          id: experiment.id, 
          rawResult: await runExperiment(experiment)
        }
        res.json(result)
        break
      default:
        res.setHeader('Allow', ['GET', 'PUT'])
        res.status(405).end(`Method ${method} Not Allowed`)
    }
  }

}

  