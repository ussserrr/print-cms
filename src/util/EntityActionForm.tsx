import * as React from 'react';

import { StyleObject } from 'styletron-react';
import { useStyletron } from 'baseui';
import { toaster } from 'baseui/toast';

import { CombinedError } from 'urql';

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

  React.useEffect(() => {
    if (data) {
      toaster.positive(`Успешно: ${actionTitle}`, {});
    }
  }, [data, actionTitle]);

  React.useEffect(() => {
    if (extensions?.warnings?.length) {
      toaster.warning(
        <div>
          <p>Внимание!</p>
          {extensions.warnings.map((warning: string, idx: number) =>
            <p key={idx}>{warning}</p>
          )}
        </div>,
        { autoHideDuration: 10000 }
      );
    }
  }, [extensions]);

  React.useEffect(() => {
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
