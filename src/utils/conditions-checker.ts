import { Condition, Conditions } from '../types';

const isEqual = require('lodash.isequal'),
      startsWith = require('lodash.startswith'),
      isString = require('lodash.isstring');

export function conditionsChecker(condition: Condition, context: Record<string, any>): boolean {
  switch (condition.condition) {

    case Conditions.Equals: {
      return Object.keys(condition.context).every((key) => isEqual(condition.context[key], context[key]));
    }

    case Conditions.NotEquals: {
      return !Object.keys(condition.context).every((key) => isEqual(condition.context[key], context[key]));
    }

    case Conditions.StartsWith: {
      return Object.keys(condition.context).every((key) => isString(condition.context[key])
          && isString(context[key])
          && startsWith(context[key], condition.context[key]));
    }

    default: {
      return false;
    }

  }
}
