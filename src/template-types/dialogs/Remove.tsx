import * as React from 'react';

import _ from 'lodash';

import * as gqlSchema from 'src/graphql-schema';
import { EntityActionDialog, PublicProps } from 'src/util/widgets/EntityActionDialog';
import { RemoveMutation, RemoveVars } from '../data';


interface Props extends PublicProps<any> {
  templateType: gqlSchema.TemplateType;
}

export function Dialog(props: Props) {
  const [vars, setVars] = React.useState<RemoveVars>();

  let title = `шаблон "${props.templateType.title}"`;
  if (props.templateType.pageOfFiles?.total) {
    title += ' и все его файлы';
  }

  return (
    <EntityActionDialog<RemoveVars>
      onSubmitted={props.onSubmitted}
      onCancel={props.onCancel}
      mode='remove'
      what={title}
      query={RemoveMutation}
      vars={vars}
      onSubmit={() => {
        setVars(_.cloneDeep(props.templateType));
      }}
    />
  );
}
