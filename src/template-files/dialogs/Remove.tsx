import * as React from 'react';

import * as gqlSchema from 'src/graphql-schema';
import { EntityActionDialog, PublicProps } from 'src/util/widgets/EntityActionDialog';

import _ from 'lodash';

import type { RemoveVars } from '../data';
import { RemoveMutation } from '../data';


interface Props extends PublicProps {
  templateFile: gqlSchema.TemplateFile;
}

export function Dialog({
  onSubmitted,
  onCancel,
  templateFile
}: Props) {
  const [vars, setVars] = React.useState<RemoveVars>();

  return (
    <EntityActionDialog<RemoveVars>
      onSubmitted={onSubmitted}
      onCancel={onCancel}
      mode='remove'
      what={`файл "${templateFile.title}"`}
      formContent={
        templateFile.isCurrentFileOfItsType
        ? 'Внимание, файл является текущим для данного шаблона'
        : undefined
      }
      query={RemoveMutation}
      vars={vars}
      onSubmit={() => setVars(_.cloneDeep(templateFile))}
    />
  );
}
