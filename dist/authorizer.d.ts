import { Claims, IAuthorizer, IClaimer, Role } from './types';
export declare class Authorizer implements IAuthorizer {
    private _roles;
    constructor(roles: readonly Role[]);
    generateClaimerForSubject(claims: Claims): IClaimer;
}
