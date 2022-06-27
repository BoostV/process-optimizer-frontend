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

import { exists, mapValues } from '../runtime';

/**
 * 
 * @export
 * @interface ExperimentData
 */
export interface ExperimentData {
    /**
     * 
     * @type {Array<string | number>}
     * @memberof ExperimentData
     */
    xi?: Array<string | number>;
    /**
     * 
     * @type {Array<number>}
     * @memberof ExperimentData
     */
    yi?: Array<number>;
}

export function ExperimentDataFromJSON(json: any): ExperimentData {
    return ExperimentDataFromJSONTyped(json, false);
}

export function ExperimentDataFromJSONTyped(json: any, ignoreDiscriminator: boolean): ExperimentData {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'xi': !exists(json, 'xi') ? undefined : ((json['xi'] as Array<any>)),
        'yi': !exists(json, 'yi') ? undefined : json['yi'],
    };
}

export function ExperimentDataToJSON(value?: ExperimentData | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'xi': value.xi === undefined ? undefined : ((value.xi as Array<any>)),
        'yi': value.yi,
    };
}

