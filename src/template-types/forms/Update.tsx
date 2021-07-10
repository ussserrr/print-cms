import * as React from 'react';

import { useHistory, useLocation } from 'react-router-dom';

import { StyleObject } from 'styletron-standard';
import { useStyletron } from 'baseui';
import { FormControl } from 'baseui/form-control';
import { Input } from 'baseui/input';
import { Checkbox } from 'baseui/checkbox';
import { Button } from 'baseui/button';
import { toaster } from 'baseui/toast';

import { useMutation } from 'urql';

import { useFormik } from 'formik';

import * as gqlSchema from 'src/graphql-schema';
import { EntityActionForm } from 'src/util/widgets/EntityActionForm';
import { useScreenSize } from 'src/util/hooks';
import { UpdateData, UpdateMutation, UpdateVars } from '../data';


/**
 * To update the cache after mutation one need to switch from the default caching mechanism
 * (Document caching) to Normalized cache. See https://formidable.com/open-source/urql/docs/graphcache/
 * for more information. It states:
 *
 * You can implement update functions that tell Graphcache how to update its data after a mutation
 * has been executed, or whenever a subscription sends a new event. This allows the cache to reactively
 * update itself without queries having to perform a refetch.
 */

interface Props {
  templateType: gqlSchema.TemplateType;
  onSubmitted?: () => void;
  currentFileId?: string;
  currentFileIdTouched: boolean;
  containerStyle?: StyleObject;
  formStyle?: StyleObject;
  shouldActivate?: boolean;
}

export function Form({
  templateType,
  onSubmitted,
  currentFileId,
  currentFileIdTouched,
  containerStyle,
  formStyle,
  shouldActivate
}: Props) {
  const [css] = useStyletron();
  const size = useScreenSize();

  const history = useHistory();
  const location = useLocation();

  const [{fetching, data, error, extensions}, mutate] = useMutation<UpdateData, UpdateVars>(UpdateMutation);

  const hasFiles = templateType.pageOfFiles?.total ? true : false;

  const [activeValue, setActiveValue] = React.useState<boolean>(templateType.active);
  const [activeDisabled, setActiveDisabled] = React.useState<boolean>();
  const [activeCaption, setActiveCaption] = React.useState<string>();
  const [activeShouldRecalculate, setActiveShouldRecalculate] = React.useState<boolean>();

  const formik = useFormik<gqlSchema.UpdateTemplateTypeInput>({
    enableReinitialize: true,
    initialValues: templateType,
    validate: values => {
      const errors: Partial<Record<keyof gqlSchema.UpdateTemplateTypeInput, string>> = {};

      if (!values.title?.length) {
        errors.title = 'Укажите название шаблона';
      }

      return errors;
    },
    onSubmit: async values => {
      await mutate({
        id: templateType.id,
        data: {
          title: values.title,
          active: values.active,
          currentFileId: values.currentFileId ?? (null!)
        }
      });
      if (onSubmitted) onSubmitted();
    }
  });

  React.useEffect(() => {
    if (hasFiles) {
      if (currentFileIdTouched) {
        if (currentFileId) {
          setActiveValue(true);
          setActiveDisabled(false);
          setActiveCaption(undefined);
        } else {
          setActiveValue(false);
          setActiveDisabled(true);
          setActiveCaption('Отметьте один из файлов ниже как текущий чтобы активировать шаблон');
        }
      } else {
        setActiveValue(templateType.active);
        if (currentFileId && !templateType.active) {
          setActiveDisabled(false);
          setActiveCaption('Текущий файл указан, но шаблон отключен');
        } else if (!currentFileId && !templateType.active) {
          setActiveDisabled(true);
          setActiveCaption('Отметьте один из файлов ниже как текущий чтобы активировать шаблон');
        } else {
          setActiveCaption(undefined);
        }
      }
    } else {
      setActiveValue(templateType.active);
      setActiveDisabled(true);
      setActiveCaption('Шаблон не может быть активирован так как у него отсутствует файл');
    }
  }, [currentFileIdTouched, hasFiles, currentFileId, templateType]);

  React.useEffect(() => {
    if (activeShouldRecalculate) {
      setActiveShouldRecalculate(false);
      if (activeValue) {
        setActiveCaption(undefined);
      } else {
        setActiveCaption('Текущий файл указан, но шаблон отключен');
      }
    }
  }, [activeShouldRecalculate, activeValue]);

  React.useEffect(() => {
    if (shouldActivate) {
      mutate({
        id: templateType.id,
        data: { active: true }
      }).then(() => {
        history.replace(location.pathname);  // clear History context (state property)
        toaster.positive('Шаблон активирован и доступен для печати', {});
      });
    }
  }, [shouldActivate, mutate, templateType, history, location]);


  return (
    <EntityActionForm
      actionTitle={`Изменить шаблон "${templateType.title}"`}
      containerStyle={containerStyle}
      formStyle={formStyle}
      formContent={
        <>
          <div className={css({
            ...((size > 720) ? {
              margin: '0 1rem 1rem 0',
              minWidth: '250px',
              width: '30%',
              maxWidth: '350px',
            } : {
              margin: '0 0 0.5rem 0',
            })
          })}>
            <FormControl
              label='Название'
              error={formik.errors.title}
            >
              <Input
                name='title'
                value={formik.values.title}
                onChange={formik.handleChange}
                error={Boolean(formik.errors.title)}
              />
            </FormControl>
          </div>

          <div className={css({
            ...((size > 720) ? {
              margin: '0 1rem 1rem 0',
              minWidth: '320px',
              width: '50%',
              maxWidth: '450px',
            } : {
              margin: '0 0 0.5rem 0',
            })
          })}>
            <FormControl
              label='Доступность шаблона для выбора при печати'
              caption={activeCaption}
              disabled={activeDisabled}
            >
              <Checkbox
                name='active'
                checked={activeValue}
                onChange={e => {
                  setActiveValue(e.currentTarget.checked);
                  setActiveShouldRecalculate(true);
                }}
              >
                Активен?
              </Checkbox>
            </FormControl>
          </div>

          <Button
            type='submit'
            isLoading={fetching}
            disabled={fetching}
            onClick={async () => {
              await formik.setFieldValue('active', activeValue);
              await formik.setFieldValue('currentFileId', currentFileId);
              formik.handleSubmit();
            }}
          >
            Сохранить
          </Button>
        </>
      }
      data={data}
      error={error}
      extensions={extensions}
    />
  );
}
