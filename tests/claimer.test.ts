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
      ADMIN_CLAIM: RoleClaim = { id: 'admin-claim' },
      USER_CLAIM: RoleClaim = { id: 'user-claim' },
      CONTEXT_CLAIM: RoleClaim = { id: 'context-claim' };

describe('Classe Claimer', () => {
  it('deveria instanciar corretamente', () => {
    const claims = { subject: 'charles-xavier', roles: [ ADMIN_CLAIM ] },
          claimer = () => new Claimer(ROLES, claims);

    expect(claimer).not.toThrowError();
  });

  describe('método isAllowed()', () => {
    it('deveria permitir acesso para usuário com permissão', () => {
      const claims = { subject: 'charles-xavier', roles: [ ADMIN_CLAIM ] },
            claimer = new Claimer(ROLES, claims),
            result = claimer.isAllowed('auth:tokens', 'auth:refheshToken');

      expect(result).toBe(true);
    });

    it('deveria negar acesso para usuário sem permissão', () => {
      const claims = { subject: 'wayne-wilson', roles: [ USER_CLAIM ] },
            claimer = new Claimer(ROLES, claims),
            results = [
              claimer.isAllowed('auth:tokens', 'auth:refheshToken'),
              claimer.isAllowed('auth:tokens', 'auth:generateToken'),
            ];

      expect(results).toMatchObject([ false, true ]);
    });

    it('deveria negar acesso para usuário baseado em um contexto', () => {
      const claims = { subject: 'wayne-wilson', roles: [ USER_CLAIM ] },
            claimer = new Claimer(ROLES, claims),
            results = [
              claimer.isAllowed('auth:users', 'auth:killTokens', { context: { name: claims.subject } }),
              claimer.isAllowed('auth:users', 'auth:killTokens', { context: { name: 'other-name' } }),
            ];

      expect(results).toMatchObject([ true, false ]);
    });

    it('deveria lançar um erro caso um contexto utilizando jsonpath não for fornecido', () => {
      const claims = { subject: 'wayne-wilson', roles: [ CONTEXT_CLAIM ] },
            result = () => new Claimer(ROLES, claims);

      expect(result).toThrow();
    });

    it('deveria negar acesso para usuário baseado em um contexto utilizando jsonpath', () => {
      const author = 'wayne-wilson',
            claims = { subject: 'wayne-wilson', roles: [ { ...CONTEXT_CLAIM, context: { author } } ] },
            claimer = new Claimer(ROLES, claims),
            results = [
              claimer.isAllowed('auth:items', 'auth:complexItem', { context: { name: author } }),
              claimer.isAllowed('auth:items', 'auth:complexItem', { context: { name: 'other-name' } }),
            ];

      expect(results).toMatchObject([ true, false ]);
    });
  });
});
