import * as React from 'react';

import _ from 'lodash';

import { useStyletron } from 'baseui';
import { toaster } from 'baseui/toast';
import { Label3 } from 'baseui/typography';
import { FormControl } from 'baseui/form-control';
import { Input } from 'baseui/input';
import { Checkbox } from 'baseui/checkbox';
import { FileUploader } from 'baseui/file-uploader';

import { gql } from 'urql';

import { useFormik } from 'formik';

import * as gqlSchema from 'src/graphql-schema';
import { EntityActionDialog, PublicProps } from 'src/util/EntityActionDialog';
import { ServiceConfigContext } from 'src/config';


export interface Props extends PublicProps {
  forTemplateType: gqlSchema.TemplateType;
}

interface MutationVars {
  file: File;
  data: gqlSchema.CreateTemplateFileInput;
}

type FormData = {
  file?: File
} & gqlSchema.CreateTemplateFileInput;

/**
 * TODO:
 * These queries/mutations are not properly typed! Seems like we can type the function call
 * (i.e. tell the TS about expected types) but the actual string still will not be checked
 */
const QUERY = gql`
  mutation CreateFile(
    $file: Upload!
    $data: CreateTemplateFileInput!
  ) {
    createTemplateFile(
      file: $file
      data: $data
    ) {
      id
      title
      mimeType
      templateType {
        id  # return this to notify cache manager about a new entity
      }
      isCurrentFileOfItsType
      updatedAt
    }
  }
`;

export function Dialog(props: Props) {
  const [, theme] = useStyletron();

  const [vars, setVars] = React.useState<MutationVars>();

  const formik = useFormik<FormData>({
    initialValues: {
      file: undefined,
      templateTypeId: props.forTemplateType.id,
      title: '',
      isCurrentFileOfItsType: true
    },
    validate: values => {
      const errors: Partial<Record<keyof FormData, string>> = {};
      if (!values.file?.name || !values.file?.size) {
        errors.file = 'Файл обязателен';
      }
      return errors;
    },
    onSubmit: values => setVars({
      file: values.file!,
      data: _.omit(values, ['file'])
    })
  });

  const currentFile = props.forTemplateType.pageOfFiles?.items.find(file => file.isCurrentFileOfItsType);

  const serviceConfig = React.useContext(ServiceConfigContext);
  let allowedExtensions = '', allowedMimeTypes = '';
  if ('loading' in serviceConfig) {
    allowedExtensions = 'подождите...';
  } else if ('error' in serviceConfig) {
    allowedExtensions = 'Ошибка получения от сервиса допустимых типов файлов';
  } else {
    allowedExtensions = serviceConfig.allowedFileTypes
      .map(fileType => fileType.extension)
      .join(', ');
    allowedMimeTypes = serviceConfig.allowedFileTypes
      .map(fileType => fileType.mime)
      .join(',');
  }


  return (
    <EntityActionDialog<MutationVars>
      onSubmitted={props.onSubmitted}
      onCancel={args => {
        // formik.resetForm();
        props.onCancel(args);
      }}
      mode='create'
      what={`файл для шаблона "${props.forTemplateType.title}"`}
      formStyle={{
        display: 'grid',
        gap: '0.5rem'
      }}
      formContent={
        <>
          <div>
            <FormControl
              label='Файл'
              caption={'Форматы: ' + allowedExtensions}
              error={formik.errors.file}
            >
              <FileUploader
                name='file'
                multiple={false}
                accept={allowedMimeTypes}  // https://github.com/okonet/attr-accept format
                onDrop={async (acceptedFiles, rejectedFiles) => {
                  if (rejectedFiles?.length) {
                    toaster.warning('Обнаружен неподдерживаемый файл(ы)', {});
                  }
                  if (acceptedFiles?.length) {
                    await formik.setFieldValue('file', acceptedFiles[0]);
                    formik.setFieldValue('title', acceptedFiles[0].name);
                  }
                }}
                onCancel={() => formik.setFieldValue('file', undefined)}
                progressMessage={formik.values.file?.name}  // display the file name instead of a progress
                overrides={{
                  FileDragAndDrop: {
                    style: formik.errors.file
                      ? { backgroundColor: theme.colors.backgroundLightNegative }
                      : {}
                  },
                  Spinner: {
                    component: () => <Label3>Выбранный файл</Label3>  // don't use the spinner here
                  }
                }}
              />
            </FormControl>
          </div>

          {
            formik.values.file
            ? <div>
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
              </div>
            : null
          }

          <div>
            <FormControl
              caption={
                currentFile
                ? `Сейчас файл "${currentFile.title}" является текущим`
                : 'У данного шаблона сейчас нет текущего файла'
              }
            >
              <Checkbox
                name='isCurrentFileOfItsType'
                checked={formik.values.isCurrentFileOfItsType}
                onChange={formik.handleChange}
              >
                Сделать текущим?
              </Checkbox>
            </FormControl>
          </div>

          {
            'filesToKeep' in serviceConfig && props.forTemplateType.pageOfFiles?.total === serviceConfig.filesToKeep
              ? <Label3 color={theme.colors.warning}>
                  У данного шаблона уже прикреплено максимальное количество файлов. Следующий файл заменит собой самый ранний из них
                </Label3>
              : null
          }
        </>
      }
      query={QUERY}
      vars={vars}
      onSubmit={formik.handleSubmit}
    />
  );
}
