import { Claimer } from './claimer';
import { Claims, IAuthorizer, IClaimer, Role } from './types';

export class Authorizer implements IAuthorizer {

  private _roles: readonly Role[];

  public constructor(roles: readonly Role[]) {
    this._roles = roles;
  }

  public generateClaimerForSubject(claims: Claims): IClaimer {
    return new Claimer(this._roles, claims);
  }

}
