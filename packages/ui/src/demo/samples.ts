import multiClean from '@ui/testing/sample-data/multi-clean-trade-off.json'
import multiCleanCalculated from '@ui/testing/sample-data/multi-clean-trade-off-calculated.json'
import multiFilled from '@ui/testing/sample-data/multi-new-first-filled.json'
import multiFilledRun from '@ui/testing/sample-data/multi-new-first-filled-run.json'
import catapult from '@ui/testing/sample-data/catapult.json'
import catapultJsonPlot from '@ui/testing/sample-data/catapult-json-plot.json'
import catapultMulti from '@ui/testing/sample-data/catapult-multi.json'
import cake from '@ui/testing/sample-data/cake.json'
import cakeMulti from '@ui/testing/sample-data/cake-multi.json'
import cfpsSingle from '@ui/testing/sample-data/cfps-single.json'
import cfpsMulti from '@ui/testing/sample-data/cfps-multi.json'

// Kebab-case names are the stable addressing keys used by ?sample=<name> and
// by the inspection harness. Keep them aligned with the file names.
export const samples = {
  'multi-clean-trade-off': multiClean,
  'multi-clean-trade-off-calculated': multiCleanCalculated,
  'multi-new-first-filled': multiFilled,
  'multi-new-first-filled-run': multiFilledRun,
  catapult: catapult,
  'catapult-json-plot': catapultJsonPlot,
  'catapult-multi': catapultMulti,
  cake: cake,
  'cake-multi': cakeMulti,
  'cfps-single': cfpsSingle,
  'cfps-multi': cfpsMulti,
} as const

export type SampleName = keyof typeof samples

export const sampleLabels: Record<SampleName, string> = {
  'multi-clean-trade-off': 'Multi Objective Sample',
  'multi-clean-trade-off-calculated': 'Multi Objective Sample Calculated',
  'multi-new-first-filled': 'Multi test',
  'multi-new-first-filled-run': 'Multi run',
  catapult: 'Catapult',
  'catapult-json-plot': 'Catapult JSON plots',
  'catapult-multi': 'Multi Objective Catapult',
  cake: 'Cake',
  'cake-multi': 'Multi Objective Cake',
  'cfps-single': 'CFPS Single Objective',
  'cfps-multi': 'CFPS Multi Objective',
}
