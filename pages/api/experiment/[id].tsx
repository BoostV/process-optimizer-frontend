import { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs';
import path from 'path';
import { ExperimentType } from '../../../types/common';
import { emptyExperiment } from '../../../store';

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

export default (req: NextApiRequest, res: NextApiResponse<ExperimentType>) => {
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
      default:
        res.setHeader('Allow', ['GET', 'PUT'])
        res.status(405).end(`Method ${method} Not Allowed`)
    }
  }

}

  