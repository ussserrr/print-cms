import { CombinedError, gql } from 'urql';

import { DateTime } from 'luxon';

import * as gqlSchema from 'src/graphql-schema';
import { gqlClient } from 'src/App';


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


export function print(vars: PrintVars) {
  return gqlClient
    .query<PrintData, PrintVars>(
      PrintQuery, vars,
      { requestPolicy: 'network-only' }
    )
    .toPromise();
}


export interface PrintData {
  printTemplateType: gqlSchema.PrintOutput;
}

export interface PrintVars {
  id: string;
  userId: number;
  fillData?: object;
}

export const PrintQuery = gql`
  query PrintTemplateType(
    $id: ID!,
    $userId: Int!,
    $fillData: JSON = {}
  ) {
    printTemplateType(
      id: $id,
      userId: $userId,
      fillData: $fillData
    ) {
      token
    }
  }
`;
