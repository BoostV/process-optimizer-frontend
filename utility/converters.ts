import { ExperimentData } from "../openapi"
import { VariableType, DataPointType, ExperimentType, ScoreDataPointType, SpaceType } from "../types/common"

export const calculateSpace = (experiment: ExperimentType): SpaceType => {
    const numeric: SpaceType = experiment.valueVariables.map(v => { return {type: "numeric", name: v.name, from: Number(v.minVal), to: Number(v.maxVal)}})
    const categorial: SpaceType = experiment.categoricalVariables.map((v) => { return {type: "category", name: v.name, categories: v.options}})
    return numeric.concat(categorial)
  }
const numPat = / [0-9] + /
export const calculateData = (categorialValues: VariableType[], numericValues: VariableType[], dataPoints: DataPointType[][]): ExperimentData[] => {
    return dataPoints.map((run):ExperimentData => ({xi: run.filter(it => it.name !== "score").map(it => numericValues.find(p => p.name === it.name) ? Number(it.value) : it.value), yi: Number((run.filter(it => it.name === "score")[0] as ScoreDataPointType).value[0])}))
}