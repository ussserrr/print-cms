/**
 * Convenient generic header for list data models.
 *
 * Shows some title and small button to add a new element, reducing the burden on parent.
 */

import React from 'react';

import { useStyletron } from 'baseui';
import { LabelLarge } from 'baseui/typography';
import { Button, SHAPE, SIZE } from 'baseui/button';
import { Plus } from 'baseui/icon';

import type { PublicProps as EntityDialogPublicProps } from './EntityActionDialog';


type PredefinedProps<ResultData> = EntityDialogPublicProps<ResultData> & { mode: 'create' };

type Props<CreateDialogProps, ResultData> = {
  title?: string;
  dialogIsOpenInitially?: boolean;
  onCreated?: (data: ResultData) => any;
  createDialog: React.ComponentType<CreateDialogProps>;
  createDialogProps?: Omit<CreateDialogProps, keyof PredefinedProps<ResultData>>;
}


export default function TablePreHeader<
  CreateDialogProps extends EntityDialogPublicProps<ResultData>,
  ResultData = any
>({
  title,
  dialogIsOpenInitially,
  onCreated,
  createDialog: Dialog,
  createDialogProps: otherProps = {} as CreateDialogProps
}: Props<CreateDialogProps, ResultData>)
{
  const [css] = useStyletron();

  const [dialogIsOpen, setDialogIsOpen] = React.useState(dialogIsOpenInitially);

  const addingSpecificProps: PredefinedProps<ResultData> = {
    mode: 'create',
    onSubmitted: (data: ResultData) => {
      setDialogIsOpen(false);
      if (onCreated) onCreated(data);
    },
    onCancel: () => setDialogIsOpen(false)
  };

  return (
    <div className={css({
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '0.5rem'
    })}>
      <LabelLarge>{title}</LabelLarge>

      <>
        <Button
          shape={SHAPE.circle}
          size={SIZE.mini}
          onClick={() => setDialogIsOpen(true)}
        >
          <Plus size={20} title='Добавить' />
        </Button>
        {
          dialogIsOpen
          ? <Dialog
              {...addingSpecificProps}
              {...otherProps as CreateDialogProps}  // https://stackoverflow.com/a/60735856/7782943
            />
          : null
        }
      </>
    </div>
  );
}
