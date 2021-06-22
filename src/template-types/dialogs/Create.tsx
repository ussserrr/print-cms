import * as React from 'react';

import { FormControl } from 'baseui/form-control';
import { Select, Value } from 'baseui/select';
import { Input } from 'baseui/input';

import { gql } from 'urql';

import { useFormik } from 'formik';

import * as gqlSchema from 'src/graphql-schema';
import { ServiceConfigContext } from 'src/config';
import { EntityActionDialog, PublicProps } from 'src/util/EntityActionDialog';


interface MutationVars {
  data: gqlSchema.CreateTemplateTypeInput;
}

export interface MutationData {
  createTemplateType: gqlSchema.TemplateType;
}

const QUERY = gql`
  mutation CreateType($data: CreateTemplateTypeInput!) {
    createTemplateType(data: $data) {
      id
    }
  }
`;

interface FormData {
  owner: Value;
  title: string;
}

export type Props = PublicProps<MutationData>


export function Dialog(props: Props) {
  const [vars, setVars] = React.useState<MutationVars>();

  const formik = useFormik<FormData>({
    initialValues: {
      owner: [],
      title: ''
    },
    validate: values => {
      const errors: Partial<Record<keyof FormData, string>> = {};

      if (!values.owner.length) {
        errors.owner = 'Укажите владельца шаблона';
      }
      if (!values.title?.length) {
        errors.title = 'Укажите название шаблона';
      }

      return errors;
    },
    onSubmit: values => {
      setVars({
        data: {
          owner: values.owner[0].id as gqlSchema.Owner,
          title: values.title
        }
      });
    }
  });

  const serviceConfig = React.useContext(ServiceConfigContext);
  const owners = 'owners' in serviceConfig ? serviceConfig.owners : undefined;


  return (
    <EntityActionDialog<MutationVars, MutationData>
      onSubmitted={props.onSubmitted}
      onCancel={props.onCancel}
      typenamesToInvalidate={props.typenamesToInvalidate}
      mode='create'
      what='шаблон'
      formStyle={{
        display: 'grid',
        gap: '0.5rem'
      }}
      formContent={
        <>
          <div>
            <FormControl
              label='Владелец*'
              caption={'loading' in serviceConfig ? 'Загрузка возможных владельцев...' : 'Для кого или чего предназначается шаблон'}
              error={'error' in serviceConfig ? 'Ошибка получения от сервиса возможных владельцев' : formik.errors.owner}
              disabled={owners === undefined}
            >
              <Select
                options={owners}
                value={formik.values.owner}
                onChange={({ value }) => {
                  formik.setFieldTouched('owner');
                  if (value.length) {
                    formik.setFieldValue('owner', value);
                  } else {
                    formik.setFieldValue('owner', []);
                  }
                }}
                error={formik.touched.owner && Boolean(formik.errors.owner)}
                overrides={{
                  Input: {
                    props: {
                      name: 'owner',
                      onBlur: formik.handleBlur
                    }
                  },
                  ClearIcon: {
                    props: {
                      title: 'Очистить'
                    }
                  },
                  SelectArrow: {
                    props: {
                      title: 'Открыть'
                    }
                  }
                }}
              />
            </FormControl>
          </div>

          <div>
            <FormControl
              label='Название*'
              error={formik.touched.title && formik.errors.title}
            >
              <Input
                name='title'
                value={formik.values.title}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.title && Boolean(formik.errors.title)}
              />
            </FormControl>
          </div>
        </>
      }
      query={QUERY}
      vars={vars}
      onSubmit={() => {
        formik.handleSubmit();
      }}
    />
  );
}
