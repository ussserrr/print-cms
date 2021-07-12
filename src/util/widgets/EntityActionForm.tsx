/**
 * HTML form HOC to use for create/update/remove actions on some data models.
 *
 * The form content iteslf is supplied by the caller so it can implement any
 * validation strategy as it wants.
 *
 * Component will react on data/error/extensions events and show appropriate
 * visuals (text box/notification bubble).
 */

import * as React from 'react';

import type { StyleObject } from 'styletron-react';
import { useStyletron } from 'baseui';
import { toaster } from 'baseui/toast';

import { CombinedError } from 'urql';

import { TOAST_AUTO_HIDE_DURATION } from 'src/util/constants';
import ErrorsList from './ErrorsList';


type Props<ResultData> = {
  actionTitle?: string;
  containerStyle?: StyleObject;
  formStyle?: StyleObject;
  formContent?: React.ReactNode | (() => React.ReactNode);
  data?: ResultData;
  error?: CombinedError;
  extensions?: Record<string, any>;
}


export function EntityActionForm<ResultData = any>({
  actionTitle,
  containerStyle,
  formStyle,
  formContent,
  data,
  error,
  extensions
}: Props<ResultData>) {
  const [css] = useStyletron();

  [actionTitle] = React.useState(actionTitle);

  React.useEffect(() => {  // show the notification on success
    if (data) {
      toaster.positive(`Успешно: ${actionTitle}`, {});
    }
  }, [data, actionTitle]);

  React.useEffect(() => {  // show any passed extensions (typically warnings)
    if (extensions?.warnings?.length) {
      toaster.warning(
        <div>
          <p>Внимание!</p>
          {extensions.warnings.map((warning: string, idx: number) =>
            <p key={idx}>{warning}</p>
          )}
        </div>,
        { autoHideDuration: 2 * TOAST_AUTO_HIDE_DURATION }  // double down the default
      );
    }
  }, [extensions]);

  React.useEffect(() => {  // show the notification on error
    if (error) {
      toaster.negative(`Ошибка: ${actionTitle}`, {});
    }
  }, [error, actionTitle]);


  return (
    <div className={css({
      display: 'flex',
      flexDirection: 'column',
      ...containerStyle
    })}>
      <form className={formStyle ? css(formStyle) : undefined}>
        {formContent}
      </form>
      {
        error
        ? <ErrorsList error={error} />
        : null
      }
    </div>
  );
}
