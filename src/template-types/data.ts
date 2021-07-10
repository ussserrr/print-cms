import { gql } from 'urql';
import { pipe, subscribe } from 'wonka';

import { gqlClient } from 'src/App';
import * as gqlSchema from 'src/graphql-schema';


export interface FindVars {
  filter?: gqlSchema.TemplateTypesFilter;
  options?: gqlSchema.TemplateTypesRequestOptions;
}
export interface GetVars {
  id: string;
}
export interface CreateVars {
  data: gqlSchema.CreateTemplateTypeInput;
}
export interface UpdateVars {
  id: string;
  data: gqlSchema.UpdateTemplateTypeInput;
}
export interface RemoveVars {
  id: string;
}


export interface FindData {
  templateTypes: gqlSchema.TemplateTypesPageResult;
}
export interface GetData {
  templateType: gqlSchema.TemplateType;
}
export interface CreateData {
  createTemplateType: gqlSchema.TemplateType;
}
export interface UpdateData {
  updateTemplateType: gqlSchema.TemplateType;
};
export interface RemoveData {
  removeTemplateType: gqlSchema.TemplateType;
};


const ListFragment = gql`
  fragment UserFragment on TemplateTypesPageResult {
    total
    items {
      id
      owner
      title
      active
      currentFile {
        id
        title
      }
    }
  }
`;
const CardFragment = gql`
  fragment UserFragment on TemplateType {
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
`;
const CreateFragment = gql`
  fragment UserFragment on TemplateType {
    id
  }
`;
const UpdateFragment = CreateFragment;
const RemoveFragment = CreateFragment;


export const FindQuery = gql`
  query FindTemplateTypes(
    $filter: TemplateTypesFilter = {}
    $options: TemplateTypesRequestOptions = {}
  ) {
    templateTypes(
      filter: $filter
      options: $options
    ) {
      ...UserFragment
    }
  }
  ${ListFragment}
`;
export const GetQuery = gql`
  query GetTemplateType($id: ID!) {
    templateType(id: $id) {
      ...UserFragment
    }
  }
  ${CardFragment}
`;
export const CreateMutation = gql`
  mutation CreateTemplateType($data: CreateTemplateTypeInput!) {
    createTemplateType(data: $data) {
      ...UserFragment
    }
  }
  ${CreateFragment}
`;
export const UpdateMutation = gql`
  mutation UpdateTemplateType(
    $id: ID!
    $data: UpdateTemplateTypeInput!
  ) {
    updateTemplateType(
      id: $id
      data: $data
    ) {
      ...UserFragment
    }
  }
  ${UpdateFragment}
`;
export const RemoveMutation = gql`
  mutation RemoveTemplateType($id: ID!) {
    removeTemplateType(id: $id) {
      ...UserFragment
    }
  }
  ${RemoveFragment}
`;


export async function getTemplateTypeById(id: string): Promise<gqlSchema.TemplateType | undefined> {
  /**
   * This will return a cached value, if present.
   * Use wonka's API - .toPromise() version doesn't work (prevents other requests to execute)
   */
  return new Promise<gqlSchema.TemplateType | undefined>(resolve => pipe(
    gqlClient.query<GetData, GetVars>(
      GetQuery,
      { id }
    ),
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
