import { Authorizer } from '../src/authorizer';
import { Claimer } from '../src/claimer';
import { Condition, Conditions, Effects, Policy, Role, RoleClaim } from '../src/types';

const CONDITION: Condition = { condition: Conditions.Equals, context: { name: 'wayne-wilson' } },
      COMPLEX_CONDITION: Condition = { condition: Conditions.Equals, context: { name: '$.author' } },
      FULL_AUTH_POLICY: Policy = { effect: Effects.Allow, actions: [ '*' ], resources: [ 'auth:tokens' ] },
      DENIED_ITEM: Policy = { effect: Effects.Deny, actions: [ 'auth:refheshToken' ], resources: [ 'auth:tokens' ] },
      IF_ITEM: Policy = {
        effect: Effects.Allow,
        actions: [ 'auth:killTokens' ],
        resources: [ 'auth:users' ],
        conditions: [ CONDITION ],
      },
      COMPLEX_ITEM: Policy = {
        effect: Effects.Allow,
        actions: [ 'auth:complexItem' ],
        resources: [ 'auth:items' ],
        conditions: [ COMPLEX_CONDITION ],
      },
      ADMIN_ROLE: Role = { id: 'admin-claim', policies: [ FULL_AUTH_POLICY ] },
      USER_ROLE: Role = { id: 'user-claim', policies: [ FULL_AUTH_POLICY, DENIED_ITEM, IF_ITEM ] },
      CONTEXT_ROLE: Role = { id: 'context-claim', policies: [ FULL_AUTH_POLICY, DENIED_ITEM, COMPLEX_ITEM ] },
      ROLES: Role[] = [ ADMIN_ROLE, USER_ROLE, CONTEXT_ROLE ],
      ADMIN_CLAIM: RoleClaim = { id: 'admin-claim' };

describe('Classe Authorizer', () => {
  it('deveria instanciar corretamente', () => {
    const claimer = () => new Authorizer(ROLES);

    expect(claimer).not.toThrowError();
  });

  describe('método generateClaimerForSubject()', () => {
    it('deveria retornar uma instância da classe Claimer corretamente', () => {
      const claims = { subject: 'charles-xavier', roles: [ ADMIN_CLAIM ] },
            authorizer = new Authorizer(ROLES),
            adminClaimer = authorizer.generateClaimerForSubject(claims);

      expect(adminClaimer).toBeInstanceOf(Claimer);
    });
  });
});
