import { Condition, Conditions } from '../src';
import { conditionsChecker } from '../src/utils/conditions-checker';
import { parseContextValues, resolveJsonPathValue } from '../src/utils/parse-context-values';

describe('Função resolveJsonPathValue()', () => {
  it('deveria retornar a propriedade correta do contexto', () => {
    const value = '$.foo',
          context = { foo: 'bar' },
          result = resolveJsonPathValue(value, context);

    expect(result).toBe('bar');
  });

  it('deveria lançar um erro se a propriedade não existir', () => {
    const value = '$.foo',
          context = { bar: 'bar' },
          result = () => resolveJsonPathValue(value, context);

    expect(result).toThrowError();
  });
});

describe('Função parseContextValues()', () => {
  it('deveria processar um contexto em um string', () => {
    const context = { teste: 'teste-string' },
          input = 'path:{TESTE}',
          result = parseContextValues(context, input);

    expect(result).toBe('path:teste-string');
  });

  it('deveria processar um contexto com variável em jsonpath', () => {
    const context = { text: '$.val', val: 'teste-external' },
          input = 'path:{TEXT}',
          result = parseContextValues(context, input);

    expect(result).toBe('path:teste-external');
  });

  it('deveria processar um contexto em uma condição', () => {
    const context = { teste: 'draft' },
          input: Condition = { condition: Conditions.NotEquals, context: { status: '$.teste' } },
          result = parseContextValues(context, input);

    expect(result).toMatchObject({
      condition: Conditions.NotEquals,
      context: {
        status: 'draft',
      },
    });
  });
});

describe('Função conditionsChecker()', () => {
  it('deveria validar a condição "Equals"', () => {
    const validCondition = { condition: Conditions.Equals, context: { name: 'charles-xavier' } },
          invalidCondition = { condition: Conditions.Equals, context: { name: 'wayne-wilson' } },
          context = { name: 'charles-xavier' },
          results = [
            conditionsChecker(validCondition, context),
            conditionsChecker(invalidCondition, context),
          ];

    expect(results).toMatchObject([ true, false ]);
  });

  it('deveria validar a condição "NotEquals"', () => {
    const validCondition = { condition: Conditions.NotEquals, context: { name: 'charles-xavier' } },
          invalidCondition = { condition: Conditions.NotEquals, context: { name: 'wayne-wilson' } },
          context = { name: 'charles-xavier' },
          results = [
            conditionsChecker(validCondition, context),
            conditionsChecker(invalidCondition, context),
          ];

    expect(results).toMatchObject([ false, true ]);
  });

  it('deveria validar a condição "StartsWith"', () => {
    const condition = { condition: Conditions.StartsWith, context: { name: 'charles' } },
          context = { name: 'charles-xavier' },
          invalidContext = { name: 'wayne-wilson' },
          results = [
            conditionsChecker(condition, context),
            conditionsChecker(condition, invalidContext),
          ];

    expect(results).toMatchObject([ true, false ]);
  });
});
