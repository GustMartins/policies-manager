import { Claims, IClaimer, isAllowedOptions, Policy, Role } from './types';
export declare class Claimer implements IClaimer {
    private _policies;
    constructor(roles: readonly Role[], claims: Claims);
    isAllowed(resource: string, action: string, options?: isAllowedOptions): boolean;
    applyPolicy(policy: Policy, resource: string, action: string, options?: Partial<isAllowedOptions>): boolean;
    private _checkPolicyStringPatterns;
    private _checkPolicyConditions;
}
