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
    ExperimentOptimizerConfigSpace,
    ExperimentOptimizerConfigSpaceFromJSON,
    ExperimentOptimizerConfigSpaceFromJSONTyped,
    ExperimentOptimizerConfigSpaceToJSON,
} from './ExperimentOptimizerConfigSpace';

/**
 * 
 * @export
 * @interface ExperimentOptimizerConfig
 */
export interface ExperimentOptimizerConfig {
    /**
     * 
     * @type {string}
     * @memberof ExperimentOptimizerConfig
     */
    baseEstimator?: string;
    /**
     * 
     * @type {string}
     * @memberof ExperimentOptimizerConfig
     */
    acqFunc?: string;
    /**
     * 
     * @type {number}
     * @memberof ExperimentOptimizerConfig
     */
    initialPoints?: number;
    /**
     * 
     * @type {number}
     * @memberof ExperimentOptimizerConfig
     */
    kappa?: number;
    /**
     * 
     * @type {number}
     * @memberof ExperimentOptimizerConfig
     */
    xi?: number;
    /**
     * 
     * @type {Array<ExperimentOptimizerConfigSpace>}
     * @memberof ExperimentOptimizerConfig
     */
    space?: Array<ExperimentOptimizerConfigSpace>;
}

export function ExperimentOptimizerConfigFromJSON(json: any): ExperimentOptimizerConfig {
    return ExperimentOptimizerConfigFromJSONTyped(json, false);
}

export function ExperimentOptimizerConfigFromJSONTyped(json: any, ignoreDiscriminator: boolean): ExperimentOptimizerConfig {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'baseEstimator': !exists(json, 'baseEstimator') ? undefined : json['baseEstimator'],
        'acqFunc': !exists(json, 'acqFunc') ? undefined : json['acqFunc'],
        'initialPoints': !exists(json, 'initialPoints') ? undefined : json['initialPoints'],
        'kappa': !exists(json, 'kappa') ? undefined : json['kappa'],
        'xi': !exists(json, 'xi') ? undefined : json['xi'],
        'space': !exists(json, 'space') ? undefined : ((json['space'] as Array<any>).map(ExperimentOptimizerConfigSpaceFromJSON)),
    };
}

export function ExperimentOptimizerConfigToJSON(value?: ExperimentOptimizerConfig | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'baseEstimator': value.baseEstimator,
        'acqFunc': value.acqFunc,
        'initialPoints': value.initialPoints,
        'kappa': value.kappa,
        'xi': value.xi,
        'space': value.space === undefined ? undefined : ((value.space as Array<any>).map(ExperimentOptimizerConfigSpaceToJSON)),
    };
}

