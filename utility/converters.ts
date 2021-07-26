import { ExperimentData } from "../openapi"
import { CategoricalVariableType, DataPointType, ExperimentType, ScoreDataPointType, SpaceType, ValueVariableType } from "../types/common"

export const calculateSpace = (experiment: ExperimentType): SpaceType => {
    const numerical: SpaceType = experiment.valueVariables.map(v => { const type = v.discrete ? "discrete" : "continuous"
    return {type, name: v.name, from: Number(v.minVal), to: Number(v.maxVal)}})
    const categorical: SpaceType = experiment.categoricalVariables.map((v) => { return {type: "category", name: v.name, categories: v.options} })
    return numerical.concat(categorical)
}

const numPat = / [0-9] + /
export const calculateData = (categoricalValues: CategoricalVariableType[], numericValues: ValueVariableType[], dataPoints: DataPointType[][]): ExperimentData[] => {
    return dataPoints.map((run):ExperimentData => ({xi: run.filter(it => it.name !== "score").map(it => numericValues.find(p => p.name === it.name) ? Number(it.value) : it.value), yi: Number((run.filter(it => it.name === "score")[0] as ScoreDataPointType).value[0])}))
}