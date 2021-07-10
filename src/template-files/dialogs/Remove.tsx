import * as React from 'react';

import _ from 'lodash';

import * as gqlSchema from 'src/graphql-schema';
import { EntityActionDialog, PublicProps } from 'src/util/widgets/EntityActionDialog';
import { RemoveMutation, RemoveVars } from '../data';


interface Props extends PublicProps {
  templateFile: gqlSchema.TemplateFile;
}

export function Dialog(props: Props) {
  const [vars, setVars] = React.useState<RemoveVars>();

  return (
    <EntityActionDialog<RemoveVars>
      onSubmitted={props.onSubmitted}
      onCancel={props.onCancel}
      mode='remove'
      what={`файл "${props.templateFile.title}"`}
      formContent={
        props.templateFile.isCurrentFileOfItsType
        ? 'Внимание, файл является текущим для данного шаблона'
        : undefined
      }
      query={RemoveMutation}
      vars={vars}
      onSubmit={() => {
        setVars(_.cloneDeep(props.templateFile));
      }}
    />
  );
}
