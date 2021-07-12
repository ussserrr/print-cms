import * as React from 'react';

import { useStyletron } from 'baseui';
import { FormControl } from 'baseui/form-control';
import { Input } from 'baseui/input';
import { Checkbox } from 'baseui/checkbox';
import { FileUploader } from 'baseui/file-uploader';
import { Label3 } from 'baseui/typography';
import { toaster } from 'baseui/toast';

import { useFormik } from 'formik';

import _ from 'lodash';

import * as gqlSchema from 'src/graphql-schema';
import { EntityActionDialog } from 'src/util/widgets/EntityActionDialog';
import type { PublicProps } from 'src/util/widgets/EntityActionDialog';
import { ServiceConfigContext } from 'src/service-config/data';

import type { CreateVars } from '../data';
import { CreateMutation } from '../data';


type FormData = {
  file?: File
} & gqlSchema.CreateTemplateFileInput;


export interface Props extends PublicProps {
  forTemplateType: gqlSchema.TemplateType;
}

export function Dialog({
  onSubmitted,
  onCancel,
  forTemplateType
}: Props) {
  const [, theme] = useStyletron();

  const [vars, setVars] = React.useState<CreateVars>();

  const formik = useFormik<FormData>({
    initialValues: {
      file: undefined,
      templateTypeId: forTemplateType.id,
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
      data: {
        ..._.omit(values, ['file']),
        title: values.title ? values.title : undefined
      }
    })
  });

  const currentFile = forTemplateType.pageOfFiles?.items.find(
    file => file.isCurrentFileOfItsType
  );

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
    <EntityActionDialog<CreateVars>
      onSubmitted={onSubmitted}
      onCancel={onCancel}
      mode='create'
      what={`файл для шаблона "${forTemplateType.title}"`}
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
            'filesToKeep' in serviceConfig &&
            forTemplateType.pageOfFiles?.total === serviceConfig.filesToKeep
              ? <Label3 color={theme.colors.warning}>
                  У данного шаблона уже прикреплено максимальное количество файлов.
                  Следующий файл заменит собой самый ранний из них
                </Label3>
              : null
          }
        </>
      }
      query={CreateMutation}
      vars={vars}
      onSubmit={formik.handleSubmit}
    />
  );
}
