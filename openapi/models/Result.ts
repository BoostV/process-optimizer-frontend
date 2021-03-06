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

import { exists, mapValues } from '../runtime';
import {
    ResultPlots,
    ResultPlotsFromJSON,
    ResultPlotsFromJSONTyped,
    ResultPlotsToJSON,
    ResultResult,
    ResultResultFromJSON,
    ResultResultFromJSONTyped,
    ResultResultToJSON,
} from './';

/**
 * 
 * @export
 * @interface Result
 */
export interface Result {
    /**
     * 
     * @type {Array<ResultPlots>}
     * @memberof Result
     */
    plots?: Array<ResultPlots>;
    /**
     * 
     * @type {ResultResult}
     * @memberof Result
     */
    result?: ResultResult;
}

export function ResultFromJSON(json: any): Result {
    return ResultFromJSONTyped(json, false);
}

export function ResultFromJSONTyped(json: any, ignoreDiscriminator: boolean): Result {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'plots': !exists(json, 'plots') ? undefined : ((json['plots'] as Array<any>).map(ResultPlotsFromJSON)),
        'result': !exists(json, 'result') ? undefined : ResultResultFromJSON(json['result']),
    };
}

export function ResultToJSON(value?: Result | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'plots': value.plots === undefined ? undefined : ((value.plots as Array<any>).map(ResultPlotsToJSON)),
        'result': ResultResultToJSON(value.result),
    };
}


