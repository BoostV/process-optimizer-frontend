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
 * @interface ExperimentOptimizerConfigSpace
 */
export interface ExperimentOptimizerConfigSpace {
    /**
     * 
     * @type {number}
     * @memberof ExperimentOptimizerConfigSpace
     */
    from?: number;
    /**
     * 
     * @type {number}
     * @memberof ExperimentOptimizerConfigSpace
     */
    to?: number;
}

export function ExperimentOptimizerConfigSpaceFromJSON(json: any): ExperimentOptimizerConfigSpace {
    return ExperimentOptimizerConfigSpaceFromJSONTyped(json, false);
}

export function ExperimentOptimizerConfigSpaceFromJSONTyped(json: any, ignoreDiscriminator: boolean): ExperimentOptimizerConfigSpace {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'from': !exists(json, 'from') ? undefined : json['from'],
        'to': !exists(json, 'to') ? undefined : json['to'],
    };
}

export function ExperimentOptimizerConfigSpaceToJSON(value?: ExperimentOptimizerConfigSpace | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'from': value.from,
        'to': value.to,
    };
}


