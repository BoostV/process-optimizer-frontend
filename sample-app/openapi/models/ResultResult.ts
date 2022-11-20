// @ts-nocheck
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
import {
  ResultResultModels,
  ResultResultModelsFromJSON,
  ResultResultModelsFromJSONTyped,
  ResultResultModelsToJSON,
} from './ResultResultModels'

/**
 *
 * @export
 * @interface ResultResult
 */
export interface ResultResult {
  /**
   *
   * @type {string}
   * @memberof ResultResult
   */
  pickled?: string
  /**
   *
   * @type {Array<number>}
   * @memberof ResultResult
   */
  next?: Array<number>
  /**
   *
   * @type {Array<ResultResultModels>}
   * @memberof ResultResult
   */
  models?: Array<ResultResultModels>
  /**
   *
   * @type {object}
   * @memberof ResultResult
   */
  extras?: object
}

export function ResultResultFromJSON(json: any): ResultResult {
  return ResultResultFromJSONTyped(json, false)
}

export function ResultResultFromJSONTyped(
  json: any,
  ignoreDiscriminator: boolean
): ResultResult {
  if (json === undefined || json === null) {
    return json
  }
  return {
    pickled: !exists(json, 'pickled') ? undefined : json['pickled'],
    next: !exists(json, 'next') ? undefined : json['next'],
    models: !exists(json, 'models')
      ? undefined
      : (json['models'] as Array<any>).map(ResultResultModelsFromJSON),
    extras: !exists(json, 'extras') ? undefined : json['extras'],
  }
}

export function ResultResultToJSON(value?: ResultResult | null): any {
  if (value === undefined) {
    return undefined
  }
  if (value === null) {
    return null
  }
  return {
    pickled: value.pickled,
    next: value.next,
    models:
      value.models === undefined
        ? undefined
        : (value.models as Array<any>).map(ResultResultModelsToJSON),
    extras: value.extras,
  }
}