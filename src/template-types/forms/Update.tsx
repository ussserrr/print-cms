import React from 'react';

import { useHistory, useLocation } from 'react-router-dom';

import type { StyleObject } from 'styletron-standard';
import { useStyletron } from 'baseui';
import { FormControl } from 'baseui/form-control';
import { Input } from 'baseui/input';
import { Checkbox } from 'baseui/checkbox';
import { Button } from 'baseui/button';
import { toaster } from 'baseui/toast';

import { useFormik } from 'formik';

import { useMutation } from 'urql';

import * as gqlSchema from 'src/graphql-schema';
import { EntityActionForm } from 'src/util/widgets/EntityActionForm';
import { useScreenSize } from 'src/util/hooks';

import type { UpdateData, UpdateVars } from '../data';
import { UpdateMutation } from '../data';


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
        errors.title = '?????????????? ???????????????? ??????????????';
      }

      return errors;
    },
    onSubmit: async values => {
      /**
       * To update the cache after mutation one need to switch from the default caching mechanism
       * (Document caching) to Normalized cache. See
       * https://formidable.com/open-source/urql/docs/graphcache/ for more information. Quote:
       *
       *   You can implement update functions that tell Graphcache how to update its data after a
       *   mutation has been executed, or whenever a subscription sends a new event. This allows
       *   the cache to reactively update itself without queries having to perform a refetch.
       */
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

  /**
   * Dedicated logic to validate a type activeness and show guiding messages
   */
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
          setActiveCaption('???????????????? ???????? ???? ???????????? ???????? ?????? ?????????????? ?????????? ???????????????????????? ????????????');
        }
      } else {
        setActiveValue(templateType.active);
        if (currentFileId && !templateType.active) {
          setActiveDisabled(false);
          setActiveCaption('?????????????? ???????? ????????????, ???? ???????????? ????????????????');
        } else if (!currentFileId && !templateType.active) {
          setActiveDisabled(true);
          setActiveCaption('???????????????? ???????? ???? ???????????? ???????? ?????? ?????????????? ?????????? ???????????????????????? ????????????');
        } else {
          setActiveCaption(undefined);
        }
      }
    } else {
      setActiveValue(templateType.active);
      setActiveDisabled(true);
      setActiveCaption('???????????? ???? ?????????? ???????? ?????????????????????? ?????? ?????? ?? ???????? ?????????????????????? ????????');
    }
  }, [currentFileIdTouched, hasFiles, currentFileId, templateType]);

  React.useEffect(() => {
    if (activeShouldRecalculate) {
      setActiveShouldRecalculate(false);
      if (activeValue) {
        setActiveCaption(undefined);
      } else {
        setActiveCaption('?????????????? ???????? ????????????, ???? ???????????? ????????????????');
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
        toaster.positive('???????????? ?????????????????????? ?? ???????????????? ?????? ????????????', {});
      });
    }
  }, [shouldActivate, mutate, templateType, history, location]);


  return (
    <EntityActionForm
      actionTitle={`???????????????? ???????????? "${templateType.title}"`}
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
              label='????????????????'
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
              label='?????????????????????? ?????????????? ?????? ???????????? ?????? ????????????'
              caption={activeCaption}
              disabled={activeDisabled}
            >
              <Checkbox
                name='active'
                checked={activeValue}
                onChange={event => {
                  setActiveValue(event.currentTarget.checked);
                  setActiveShouldRecalculate(true);
                }}
              >
                ???????????????
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
            ??????????????????
          </Button>
        </>
      }
      data={data}
      error={error}
      extensions={extensions}
    />
  );
}
