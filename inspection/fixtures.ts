import { test as base, expect, type Locator } from '@playwright/test'
import path from 'node:path'

const OUTPUT_DIR = path.join(__dirname, 'output')

export type Inspect = {
  /** Navigate to a sample by registry name and wait for it to render. */
  goToSample: (name: string) => Promise<void>
  /** A demo region locator. */
  region: (id: 'result' | 'plots') => Locator
  /** The Pareto front plot locator. */
  paretoPlot: () => Locator
  /** Screenshot `target` (or full page) to inspection/output/<name>.png. */
  shoot: (name: string, target?: Locator) => Promise<string>
}

export const test = base.extend<{ inspect: Inspect }>({
  // The second arg is Playwright's fixture-provide callback (passed
  // positionally). It is named `provide` rather than the conventional `use` so
  // the react-hooks lint rule doesn't mistake it for React 19's `use` hook.
  inspect: async ({ page }, provide) => {
    await provide({
      async goToSample(name) {
        await page.goto(`/?sample=${encodeURIComponent(name)}`)
        await page.getByTestId('result-region').waitFor({ state: 'visible' })
      },
      region(id) {
        return page.getByTestId(`${id}-region`)
      },
      paretoPlot() {
        // The demo renders a ParetoFrontPlot in both the Result and the Plots
        // regions; scope to the multi-objective Result (the canonical one).
        return page
          .getByTestId('result-region')
          .getByTestId('pareto-front-plot')
      },
      async shoot(name, target) {
        const file = path.join(OUTPUT_DIR, `${name}.png`)
        if (target) {
          await target.screenshot({ path: file })
        } else {
          await page.screenshot({ path: file, fullPage: true })
        }
        return file
      },
    })
  },
})

export { expect }
