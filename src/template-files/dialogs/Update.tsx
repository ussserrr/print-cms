import * as React from 'react';

import _ from 'lodash';

import { FormControl } from 'baseui/form-control';
import { Input } from 'baseui/input';

import { gql } from 'urql';

import { useFormik } from 'formik';

import * as gqlSchema from 'src/graphql-schema';
import { EntityActionDialog, PublicProps } from 'src/util/EntityActionDialog';


interface Props extends PublicProps<any> {
  templateFile: gqlSchema.TemplateFile;
}

interface MutationVars {
  id: string;
  data: gqlSchema.UpdateTemplateFileInput;
}

const QUERY = gql`
  mutation UpdateFile(
    $id: ID!
    $data: UpdateTemplateFileInput!
  ) {
    updateTemplateFile(
      id: $id
      data: $data
    ) {
      id
      title
      mimeType
      isCurrentFileOfItsType
      updatedAt
    }
  }
`;

export function Dialog({
  onSubmitted,
  onCancel,
  templateFile
}: Props) {
  const [vars, setVars] = React.useState<MutationVars>();

  const formik = useFormik<gqlSchema.TemplateFile>({
    initialValues: templateFile,
    validateOnChange: false,
    onSubmit: values => setVars({
      id: templateFile.id,
      data: _.pick(values, ['title'])
    })
  });

  return (
    <EntityActionDialog<MutationVars>
      onSubmitted={onSubmitted}
      onCancel={args => {
        onCancel(args);
      }}
      mode='update'
      what={`файл "${templateFile.title}"`}
      formContent={
        <>
          <FormControl
            label='Название'
            caption='Необязательно: "псевдоним" для файла'
          >
            <Input
              name='title'
              value={formik.values.title}
              onChange={formik.handleChange}
            />
          </FormControl>
        </>
      }
      query={QUERY}
      vars={vars}
      onSubmit={formik.handleSubmit}
    />
  );
}
