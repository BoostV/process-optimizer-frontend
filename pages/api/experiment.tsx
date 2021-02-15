import { NextApiRequest, NextApiResponse } from 'next'
import { v4 as uuidv4 } from 'uuid'

interface Experiment {
  id: string
}

export default (req: NextApiRequest, res: NextApiResponse<Experiment>) => {
  if (req.method === 'POST') {
    res.json({ id: uuidv4() })
  } else {
    console.log(req.query)
    res.json({ id: 'myID' })
  }
}
