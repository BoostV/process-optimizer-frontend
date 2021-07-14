import { ExperimentData } from "../openapi"
import { CategoricalVariableType, DataPointType, ExperimentType, ScoreDataPointType, SpaceType, ValueVariableType } from "../types/common"

export const calculateSpace = (experiment: ExperimentType): SpaceType => {
    const discrete: SpaceType = experiment.valueVariables.filter(v => v.discrete).map(v => { return {type: "discrete", name: v.name, from: Number(v.minVal), to: Number(v.maxVal)} })
    const continuous: SpaceType = experiment.valueVariables.filter(v => !v.discrete).map(v => { return {type: "continuous", name: v.name, from: Number(v.minVal), to: Number(v.maxVal)} })
    const categorial: SpaceType = experiment.categoricalVariables.map((v) => { return {type: "category", name: v.name, categories: v.options} })
    return discrete.concat(continuous, categorial)
}

const numPat = / [0-9] + /
export const calculateData = (categorialValues: CategoricalVariableType[], numericValues: ValueVariableType[], dataPoints: DataPointType[][]): ExperimentData[] => {
    return dataPoints.map((run):ExperimentData => ({xi: run.filter(it => it.name !== "score").map(it => numericValues.find(p => p.name === it.name) ? Number(it.value) : it.value), yi: Number((run.filter(it => it.name === "score")[0] as ScoreDataPointType).value[0])}))
}