import { Condition } from '../types';
export declare function resolveJsonPathValue(value: any, context: Record<string, any>): any;
export declare function parseContextValues(context: Record<string, any>, input: string | Condition): string | Condition;
