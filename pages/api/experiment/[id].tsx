import { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import path from 'path'
import { ExperimentResultType, ExperimentType } from '../../../types/common'
import {
  Configuration,
  DefaultApi,
  OptimizerapiOptimizerRunRequest,
} from '../../../openapi'
import { calculateData, calculateSpace } from '../../../utility/converters'

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '100mb',
    },
  },
}

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
  const api = new DefaultApi(
    new Configuration({ basePath: API_SERVER, fetchApi: fetch })
  )
  const cfg = experiment.optimizerConfig
  const extras = experiment.extras || {}
  const space = calculateSpace(experiment)
  // TODO data is currently hard coded
  const request: OptimizerapiOptimizerRunRequest = {
    experiment: {
      data: calculateData(
        experiment.categoricalVariables,
        experiment.valueVariables,
        experiment.scoreVariables,
        experiment.dataPoints
      ),
      extras: extras,
      optimizerConfig: {
        acqFunc: cfg.acqFunc,
        baseEstimator: cfg.baseEstimator,
        initialPoints: Number(cfg.initialPoints),
        kappa: Number(cfg.kappa),
        xi: Number(cfg.xi),
        space: space,
      },
    },
  }
  return api.optimizerapiOptimizerRun(request)
}

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<ExperimentType | ExperimentResultType | {}>
) => {
  const {
    query: { id },
    method,
    body,
  } = req
  const queryId = Array.isArray(id) ? id[0] : id
  if (queryId !== undefined && queryId !== 'undefined') {
    const dbFolder = process.env.DB_FOLDER || 'tmp'
    if (!fs.existsSync(dbFolder)) {
      fs.mkdirSync(dbFolder)
    }
    switch (method) {
      case 'GET':
        const store =
          db[queryId] || readFromFile(path.join(dbFolder, `${queryId}.json`))
        if (store) {
          res.json(store)
        } else {
          res.statusCode = 404
          res.json({})
        }
        break
      case 'PUT':
        db[queryId] = JSON.parse(body)
        writeToFile(path.join(dbFolder, `${queryId}.json`), db[queryId])
        res.json(db[queryId])
        break
      case 'POST':
        const experiment = JSON.parse(body)
        const json = await runExperiment(experiment)
        const result: ExperimentResultType = {
          id: experiment.id,
          plots:
            json.plots &&
            json.plots.map(p => {
              return { id: p.id, plot: p.plot }
            }),
          next: json.result.next,
          pickled: json.result.pickled,
          expectedMinimum: json.result.models.find(() => true)?.expectedMinimum,
          extras: json.result.extras,
        }
        res.json(result)
        break
      default:
        res.setHeader('Allow', ['GET', 'PUT', 'POST'])
        res.status(405).end(`Method ${method} Not Allowed`)
    }
  }
}

export default handler
