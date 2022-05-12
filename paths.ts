export const paths = {
  experiment: 'experiment',
}

export function buildPath(...paths: string[]): string {
  /*
  We want the '/' at the beginning since this is the only way we can
  get router.push to respect the relative "basePath" configuration.
  If we did not have the prepended "/", a navigation from ex.
  https://some-domain.com/nested/base/path to an experiment, and the basePath
  set to "basePath: '/nested/base/path'" would result in
  https://some-domain.com/nested/base/experiment/1234 and not
  https://some-domain.com/nested/base/path/experiment/1234 as expected.
  */
  return '/' + paths.join('/')
}
