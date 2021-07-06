import { CombinedError, gql } from 'urql';

import { DateTime } from 'luxon';

import * as gqlSchema from 'src/graphql-schema';
import { gqlClient } from 'src/App';


export const USER_ID = Math.floor(Math.random() * 10000);
export const REQUESTS_TIMER_WINDOW_DEFAULT = 20;  // seconds
export const TIME_TO_NEXT_REQUEST_RENDER_INTERVAL = 100;  // ms


export type PrintRequest = {
  state: 'REQUESTED';
  requestedAt: DateTime;
  template: gqlSchema.TemplateType;
} | {
  state: 'ERROR';
  requestedAt: DateTime;
  errorAt: DateTime;
  template: gqlSchema.TemplateType;
  error: CombinedError;
} | {
  state: 'REGISTERED';
  requestedAt: DateTime;
  registeredAt: DateTime;
  template: gqlSchema.TemplateType;
  token: string;
} | {
  state: 'DONE';
  requestedAt: DateTime;
  registeredAt: DateTime;
  doneAt: DateTime;
  template: gqlSchema.TemplateType;
  token: string;
  message: {
    token: string;
    error?: string;
  };
};


export interface ListData {
  templateTypes: gqlSchema.TemplateTypesPageResult;
}

export interface ListQueryVars {
  filter?: gqlSchema.TemplateTypesFilter;
  options?: gqlSchema.TemplateTypesRequestOptions;
}

// TODO: should store all queries in one place
export const LIST_QUERY = gql`
  query FindTemplateTypes(
    $filter: TemplateTypesFilter = {}
    $options: TemplateTypesRequestOptions = {}
  ) {
    templateTypes(
      filter: $filter
      options: $options
    ) {
      items {
        id
        title
      }
    }
  }
`;

export function print(vars: PrintQueryVars) {
  return gqlClient
    .query<PrintData, PrintQueryVars>(
      PRINT_QUERY, vars,
      { requestPolicy: 'network-only' }
    )
    .toPromise();
}


export interface PrintData {
  printTemplateType: gqlSchema.PrintOutput;
}

export interface PrintQueryVars {
  id: string;
  userId: number;
  fillData?: object;
}

export const PRINT_QUERY = gql`
  query PrintTemplateType(
    $id: ID!, $userId: Int!, $fillData: JSON = {}
  ) {
    printTemplateType(id: $id, userId: $userId, fillData: $fillData) {
      token
    }
  }
`;
