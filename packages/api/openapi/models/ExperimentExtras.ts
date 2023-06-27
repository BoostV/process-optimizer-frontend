/* tslint:disable */
/* eslint-disable */
/**
 * Process Optimizer API
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * The version of the OpenAPI document: 1.0
 *
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import { exists, mapValues } from '../runtime'
/**
 * A plain JSON object that can contain arbitrary values
 * @export
 * @interface ExperimentExtras
 */
export interface ExperimentExtras {
  [key: string]: string | any
  /**
   *
   * @type {string}
   * @memberof ExperimentExtras
   */
  objectivePars?: ExperimentExtrasObjectiveParsEnum
  /**
   *
   * @type {string}
   * @memberof ExperimentExtras
   */
  graphFormat?: string
  /**
   *
   * @type {number}
   * @memberof ExperimentExtras
   */
  experimentSuggestionCount?: number
  /**
   *
   * @type {number}
   * @memberof ExperimentExtras
   */
  maxQuality?: number
  /**
   *
   * @type {Array<string>}
   * @memberof ExperimentExtras
   */
  graphs?: Array<string>
}

/**
 * @export
 */
export const ExperimentExtrasObjectiveParsEnum = {
  Result: 'result',
  ExpectedMinimum: 'expected_minimum',
} as const
export type ExperimentExtrasObjectiveParsEnum =
  (typeof ExperimentExtrasObjectiveParsEnum)[keyof typeof ExperimentExtrasObjectiveParsEnum]

/**
 * Check if a given object implements the ExperimentExtras interface.
 */
export function instanceOfExperimentExtras(value: object): boolean {
  let isInstance = true

  return isInstance
}

export function ExperimentExtrasFromJSON(json: any): ExperimentExtras {
  return ExperimentExtrasFromJSONTyped(json, false)
}

export function ExperimentExtrasFromJSONTyped(
  json: any,
  ignoreDiscriminator: boolean
): ExperimentExtras {
  if (json === undefined || json === null) {
    return json
  }
  return {
    ...json,
    objectivePars: !exists(json, 'objectivePars')
      ? undefined
      : json['objectivePars'],
    graphFormat: !exists(json, 'graphFormat') ? undefined : json['graphFormat'],
    experimentSuggestionCount: !exists(json, 'experimentSuggestionCount')
      ? undefined
      : json['experimentSuggestionCount'],
    maxQuality: !exists(json, 'maxQuality') ? undefined : json['maxQuality'],
    graphs: !exists(json, 'graphs') ? undefined : json['graphs'],
  }
}

export function ExperimentExtrasToJSON(value?: ExperimentExtras | null): any {
  if (value === undefined) {
    return undefined
  }
  if (value === null) {
    return null
  }
  return {
    ...value,
    objectivePars: value.objectivePars,
    graphFormat: value.graphFormat,
    experimentSuggestionCount: value.experimentSuggestionCount,
    maxQuality: value.maxQuality,
    graphs: value.graphs,
  }
}
