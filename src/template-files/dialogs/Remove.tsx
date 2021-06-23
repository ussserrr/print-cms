import * as React from 'react';

import _ from 'lodash';

import { gql } from 'urql';

import * as gqlSchema from 'src/graphql-schema';
import { EntityActionDialog, PublicProps } from 'src/util/EntityActionDialog';


interface Props extends PublicProps {
  templateFile: gqlSchema.TemplateFile;
}

interface RemoveMutationVars {
  id: string;
}

const REMOVE_FILE = gql`
  mutation RemoveFile($id: ID!) {
    removeTemplateFile(id: $id) {
      id
    }
  }
`;

export function Dialog(props: Props) {
  const [vars, setVars] = React.useState<RemoveMutationVars>();

  return (
    <EntityActionDialog<RemoveMutationVars>
      onSubmitted={props.onSubmitted}
      onCancel={props.onCancel}
      mode='remove'
      what={`файл "${props.templateFile.title}"`}
      formContent={
        props.templateFile.isCurrentFileOfItsType
        ? 'Внимание, файл является текущим для данного шаблона'
        : undefined
      }
      query={REMOVE_FILE}
      vars={vars}
      onSubmit={() => {
        setVars(_.cloneDeep(props.templateFile));
      }}
    />
  );
}
