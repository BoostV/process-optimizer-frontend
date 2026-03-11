import { ParetoFrontPlot } from '@boostv/process-optimizer-frontend-plots'
import { TitleCard } from '../core'
import { paretoJson } from './demo-data'
import {
  selectActiveDataPoints,
  useSelector,
} from '@boostv/process-optimizer-frontend-core'

type ResultProps = {
  id?: string

  // onParetoClick?: (payload: any) => void
}

// cast the dummy data. Real data will be zod parsed
const pareto = paretoJson as unknown as {
  front_x_data: number[][]
  front_y_data: [number, number][]
  obj1_error: [number, number, number][]
  obj2_error: [number, number, number][]
  obj1_1D_data: [[[number], [number], [number], number]]
  obj2_1D_data: [[[number], [number], [number], number]]
  obj1_mean: number
  obj1_std: number
  obj2_mean: number
  obj2_std: number
  best_idx: number
}

export const Result = ({ id }: ResultProps) => {
  const dataPoints = useSelector(selectActiveDataPoints)

  return (
    <TitleCard id={id} title="Result">
      <ParetoFrontPlot
        indexOfSelected={pareto.best_idx}
        plot={pareto}
        // onClick={onParetoClick}
        dataPoints={dataPoints}
      />
    </TitleCard>
  )
}
