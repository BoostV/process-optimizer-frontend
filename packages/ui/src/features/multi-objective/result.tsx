import { ParetoFrontPlot } from '@boostv/process-optimizer-frontend-plots'
import { TitleCard } from '../core'
import { paretoJson } from './demo-data'

type ResultProps = {
  id?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onParetoClick?: (payload: any) => void
}

// cast the dummy data. Real data will be zod parsed
const pareto = paretoJson as unknown as Parameters<
  typeof ParetoFrontPlot
>[0]['plot']

export const Result = ({ id, onParetoClick }: ResultProps) => {
  return (
    <TitleCard id={id} title="Result">
      <ParetoFrontPlot plot={pareto} onClick={onParetoClick} />
    </TitleCard>
  )
}
