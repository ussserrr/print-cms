import * as React from 'react';

// import { useLocation } from 'react-router-dom';

import { useStyletron } from 'baseui';
import { LabelLarge } from 'baseui/typography';
import { Button, SHAPE, SIZE } from 'baseui/button';
import { Plus } from 'baseui/icon';

import { PublicProps as EntityDialogPublicProps } from './EntityActionDialog';


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

  const [isOpen, setIsOpen] = React.useState(dialogIsOpenInitially);

  const addingSpecificProps: PredefinedProps<ResultData> = {
    mode: 'create',
    onSubmitted: (data: ResultData) => {
      setIsOpen(false);
      if (onCreated) onCreated(data);
    },
    onCancel: () => setIsOpen(false)
  };

  return (
    <div className={css({
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '0.5rem'
    })}>
      <LabelLarge>{title}</LabelLarge>
      <React.Fragment>
        <Button shape={SHAPE.circle} size={SIZE.mini}
          onClick={() => setIsOpen(true)}
        >
          <Plus size={20} title='Добавить' />
        </Button>
        {
          isOpen
          ? <Dialog
              {...addingSpecificProps}
              {...otherProps as CreateDialogProps}  // https://stackoverflow.com/a/60735856/7782943
            />
          : null
        }
      </React.Fragment>
    </div>
  );
}
