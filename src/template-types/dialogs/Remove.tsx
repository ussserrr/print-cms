import * as React from 'react';

import _ from 'lodash';

import { gql } from 'urql';

import * as gqlSchema from 'src/graphql-schema';
import { EntityActionDialog, PublicProps } from 'src/util/EntityActionDialog';


interface Props extends PublicProps<any> {
  templateType: gqlSchema.TemplateType;
}

interface RemoveMutationVars {
  id: string;
}

const REMOVE_TYPE = gql`
  mutation RemoveType($id: ID!) {
    removeTemplateType(id: $id) {
      id
    }
  }
`;

export function Dialog(props: Props) {
  const [vars, setVars] = React.useState<RemoveMutationVars>();

  let title = `шаблон "${props.templateType.title}"`;
  if (props.templateType.pageOfFiles?.total) {
    title += ' и все его файлы';
  }
  title += '?';

  return (
    <EntityActionDialog<RemoveMutationVars>
      onSubmitted={props.onSubmitted}
      onCancel={props.onCancel}
      mode='remove'
      what={title}
      query={REMOVE_TYPE}
      vars={vars}
      onSubmit={() => {
        setVars(_.cloneDeep(props.templateType));
      }}
    />
  );
}
