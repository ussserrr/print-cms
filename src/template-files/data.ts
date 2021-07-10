/**
 * TODO:
 * These queries/mutations are not properly typed! Seems like we can type the function call
 * (i.e. tell the TS about expected types) but the actual string still will not be checked
 */

import { gql } from 'urql';

import * as gqlSchema from 'src/graphql-schema';


export interface CreateVars {
  file: File;
  data: gqlSchema.CreateTemplateFileInput;
}
export interface UpdateVars {
  id: string;
  data: gqlSchema.UpdateTemplateFileInput;
}
export interface RemoveVars {
  id: string;
}


export interface CreateData {
  createTemplateFile: gqlSchema.TemplateFile;
}
export interface UpdateData {
  updateTemplateFile: gqlSchema.TemplateFile;
};
export interface RemoveData {
  removeTemplateFile: gqlSchema.TemplateFile;
};


const CreateFragment = gql`
  fragment UserFragment on TemplateFile {
    id
    templateType {
      id  # return this to notify cache manager
    }
  }
`;
const UpdateFragment = gql`
  fragment UserFragment on TemplateFile {
    id
    title
    updatedAt
  }
`;
const RemoveFragment = CreateFragment;


export const CreateMutation = gql`
  mutation CreateTemplateFile(
    $file: Upload!
    $data: CreateTemplateFileInput!
  ) {
    createTemplateFile(
      file: $file
      data: $data
    ) {
      ...UserFragment
    }
  }
  ${CreateFragment}
`;
export const UpdateMutation = gql`
  mutation UpdateTemplateFile(
    $id: ID!
    $data: UpdateTemplateFileInput!
  ) {
    updateTemplateFile(
      id: $id
      data: $data
    ) {
      ...UserFragment
    }
  }
  ${UpdateFragment}
`;
export const RemoveMutation = gql`
  mutation RemoveTemplateFile($id: ID!) {
    removeTemplateFile(id: $id) {
      ...UserFragment
    }
  }
  ${RemoveFragment}
`;
