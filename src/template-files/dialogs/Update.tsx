import React from 'react';

import { FormControl } from 'baseui/form-control';
import { Input } from 'baseui/input';

import { useFormik } from 'formik';

import _ from 'lodash';

import * as gqlSchema from 'src/graphql-schema';
import { EntityActionDialog, PublicProps } from 'src/util/widgets/EntityActionDialog';

import type { UpdateVars } from '../data';
import { UpdateMutation } from '../data';


interface Props extends PublicProps {
  templateFile: gqlSchema.TemplateFile;
}

export function Dialog({
  onSubmitted,
  onCancel,
  templateFile
}: Props) {
  const [vars, setVars] = React.useState<UpdateVars>();

  const formik = useFormik<gqlSchema.TemplateFile>({
    initialValues: templateFile,
    validateOnChange: false,
    onSubmit: values => setVars({
      id: templateFile.id,
      data: _.pick(values, ['title'])
    })
  });

  return (
    <EntityActionDialog<UpdateVars>
      onSubmitted={onSubmitted}
      onCancel={onCancel}
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
      query={UpdateMutation}
      vars={vars}
      onSubmit={formik.handleSubmit}
    />
  );
}
