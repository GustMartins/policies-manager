import { Claims, Condition, Effects, IClaimer, isAllowedOptions, Policy, Role } from './types';
import { conditionsChecker } from './utils/conditions-checker';
import { parseContextValues } from './utils/parse-context-values';

interface ClaimerPolicies {
  deny: Policy[]
  allow: Policy[]
}

const INDEX_NOT_FOUND = -1;

export class Claimer implements IClaimer {

  private _policies: ClaimerPolicies = { deny: [], allow: [] };

  public constructor(roles: readonly Role[], claims: Claims) {
    const policies = claims.roles
      .map((claim) => {
        const expectedRole = roles.find((role) => role.id === claim.id),
              contextValueParser = parseContextValues.bind(null, claim.context || {});

        if (!expectedRole) return [];

        return expectedRole.policies.map((policy) => Object.assign({}, policy, {
          actions: policy.actions.map(contextValueParser),
          resources: policy.resources.map(contextValueParser),
          conditions: policy.conditions?.map(contextValueParser),
        }) as Policy);
      })
      .reduce((first, second) => first.concat(second), []);

    policies.forEach((policy) => {
      if (policy.effect === Effects.Allow)
        this._policies.allow.push(policy);
      else
        this._policies.deny.push(policy);
    });
  }

  public isAllowed(resource: string, action: string, options?: isAllowedOptions): boolean {
    const isDenied = this._policies.deny
      .reduce((memo, policy) => memo || this.applyPolicy(policy, resource, action, options), false);

    if (isDenied) return false;

    return this._policies.allow
      .reduce((memo, policy) => memo || this.applyPolicy(policy, resource, action, options), false);
  }

  public applyPolicy(policy: Policy, resource: string, action: string, options?: Partial<isAllowedOptions>): boolean {
    return this._checkPolicyStringPatterns(policy.resources, resource)
      && this._checkPolicyStringPatterns(policy.actions, action)
      && this._checkPolicyConditions(policy.conditions, options?.context);
  }

  private _checkPolicyStringPatterns(patterns: readonly string[], value: string): boolean {
    return patterns.reduce((memo, pattern) => {
      if (pattern.indexOf('*') === INDEX_NOT_FOUND) return memo || pattern === value;

      const regExpString = pattern
        .split(/\*+/)
        .map((part) =>
          // An empty part happens when a wildcard is at the beginning or end of the
          // string. We leave it empty so that the wildcard will get placed by the `.join`
          part === '' ? '' : part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        )
        .join('.+');

      return memo || new RegExp(`^${regExpString}$`).test(value);
    }, false);
  }

  private _checkPolicyConditions(conditions?: Condition[], context?: Record<string, any>): boolean {
    if (!conditions) return true;

    return conditions.reduce((memo, condition) => memo || conditionsChecker(condition, context || {}), false);
  }

}
