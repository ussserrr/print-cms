import type { Value } from 'baseui/select';

import * as gqlSchema from 'src/graphql-schema';

import type { FindVars as _FindVars } from '../data';


export type FindVars = Required<_FindVars>;

export type FormData = {
  search?: string;
  active?: boolean;
  owners?: Value;
  page?: number;
}

const STORAGE_KEY = 'template-types-list-vars';
export const DEFAULT_PAGE_SIZE = 10;


export function getDefaultVars(pageSize: number = DEFAULT_PAGE_SIZE): FindVars {
  return {
    filter: {
      common: {
        search: undefined
      },
      active: true
    },
    options: {
      page: {
        limit: pageSize,
        offset: 0
      }
    }
  };
}

export function retrieveSessionVars(pageSize: number = DEFAULT_PAGE_SIZE): FindVars {
  const varsJSON = sessionStorage.getItem(STORAGE_KEY);
  return varsJSON ? (JSON.parse(varsJSON) as FindVars) : getDefaultVars(pageSize);
}

export function saveSessionVars(vars: FindVars) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(vars));
}

export function clearSessionVars() {
  sessionStorage.removeItem(STORAGE_KEY);
}

export function varsToForm(
  { filter, options }: FindVars,
  pageSize: number = DEFAULT_PAGE_SIZE
): FormData {
  return {
    search: filter.common?.search ?? '',
    active: filter.active ?? true,
    owners: filter.owners?.length ? filter.owners.map(v => ({id: v})) : [],
    page: ((options.page?.offset ?? 0) / (options.page?.limit ?? pageSize)) + 1
  };
}

export function formToVars(value: FormData, pageSize: number = DEFAULT_PAGE_SIZE): FindVars {
  return {
    filter: {
      common: {
        search: value.search ? value.search : undefined
      },
      active: value.active,
      owners: value.owners?.length ? value.owners.map(v => v.id as gqlSchema.Owner) : undefined
    },
    options: {
      page: {
        limit: pageSize,
        offset: ((value.page ?? 1) - 1) * pageSize
      }
    }
  };
}
