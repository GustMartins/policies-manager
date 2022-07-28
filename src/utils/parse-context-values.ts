import * as jsonParser from 'jsonpath';

import { Condition } from '../types';

const PLACEHOLDER_PATTERN = /{[A-Z0-9_]+}/;

export function resolveJsonPathValue(value: any, context: Record<string, any>): any {
  if (typeof value === 'string') {
    const parsedValue = value.startsWith('$.') ? jsonParser.value(context, value) : value;

    if (!parsedValue)
      throw new Error(`Missing context while looking for ${value}`);

    return parsedValue;
  }

  return value;
}

function resolveContextValuePath(context: Record<string, any>, key: string): any {
  const value = context[key];

  return resolveJsonPathValue(value, context);
}

export function parseContextValues(context: Record<string, any>, input: string | Condition): string | Condition {
  if (typeof input === 'string') {
    let value = input;

    if (PLACEHOLDER_PATTERN.test(input)) {
      Object.keys(context).forEach((key) => {
        value = value.replace(new RegExp(`{${key.toUpperCase()}}`, 'g'), resolveContextValuePath(context, key));
      });

      if (PLACEHOLDER_PATTERN.test(value))
        throw new Error(`Element ${input} depends on a context value that was not supplied.`);

      return value;
    }

    return input;
  }

  if (input.context)
    return Object.assign({}, input, {
      context: {
        ...Object
          .keys(input.context)
          .map((inputContext) => ({
            [inputContext]: resolveJsonPathValue(input.context[inputContext], context),
          }))
          .shift(),
      },
    });

  return input;
}
