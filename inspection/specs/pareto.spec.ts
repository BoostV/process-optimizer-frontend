import { test } from '../fixtures'

// Worked example: an agent copies this shape to inspect any feature.
test('pareto: band default and hover ellipse', async ({ inspect }) => {
  await inspect.goToSample('multi-clean-trade-off-calculated')
  const plot = inspect.paretoPlot()
  await plot.waitFor({ state: 'visible' })
  await inspect.shoot('pareto-default', plot)
  await plot.hover()
  await inspect.shoot('pareto-hover', plot)
})
