import { gql } from 'urql';
import { pipe, subscribe } from 'wonka';

import * as gqlSchema from 'src/graphql-schema';
import { gqlClient } from 'src/App';


interface TemplateTypeData {
  templateType: gqlSchema.TemplateType;
}

interface QueryVars {
  id: string;
}

const QUERY = gql`
  query GetTemplateTypeById($id: ID!) {
    templateType(id: $id) {
      id
      owner
      title
      active
      pageOfFiles {
        total
        items {
          id
          title
          mimeType
          isCurrentFileOfItsType
          updatedAt
        }
      }
    }
  }
`;

export async function getTemplateTypeById(id: string): Promise<gqlSchema.TemplateType | undefined> {
  /**
   * This will return a cached value, if present
   * Use wonka's API - .toPromise() version doesn't work (prevents other requests to execute)
   */
  return new Promise<gqlSchema.TemplateType | undefined>(resolve => pipe(
    gqlClient.query<TemplateTypeData, QueryVars>(QUERY, { id }),
    subscribe(({ data, error }) => {
      if (error) {
        console.error(error);  // do not silently ignore
        resolve(undefined);
      } else {
        resolve(data?.templateType);
      }
    })
  ));
}
