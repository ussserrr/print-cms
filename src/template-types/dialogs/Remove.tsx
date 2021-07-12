import * as React from 'react';

import _ from 'lodash';

import * as gqlSchema from 'src/graphql-schema';
import { EntityActionDialog } from 'src/util/widgets/EntityActionDialog';
import type { PublicProps } from 'src/util/widgets/EntityActionDialog';

import type { RemoveVars } from '../data';
import { RemoveMutation } from '../data';


interface Props extends PublicProps<any> {
  templateType: gqlSchema.TemplateType;
}

export function Dialog({
  onSubmitted,
  onCancel,
  templateType
}: Props) {
  const [vars, setVars] = React.useState<RemoveVars>();

  let title = `шаблон "${templateType.title}"`;
  if (templateType.pageOfFiles?.total) {
    title += ' и все его файлы';
  }

  return (
    <EntityActionDialog<RemoveVars>
      onSubmitted={onSubmitted}
      onCancel={onCancel}
      mode='remove'
      what={title}
      query={RemoveMutation}
      vars={vars}
      onSubmit={() => setVars(_.cloneDeep(templateType))}
    />
  );
}
