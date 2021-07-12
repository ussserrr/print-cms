import * as React from 'react';

import { useStyletron } from 'styletron-react';
import { Button, SHAPE, SIZE } from 'baseui/button';

import { API_URL } from 'src/util/constants';
import * as gqlSchema from 'src/graphql-schema';

import * as Update from '../dialogs/Update';
import * as Remove from '../dialogs/Remove';


type Props = {
  templateFile: gqlSchema.TemplateFile;
  setRemovalDialogIsOpen: (flag: boolean) => void;
}


function UpdateButton({ templateFile }: Props) {
  const [dialogIsOpen, setDialogIsOpen] = React.useState(false);

  return (
    <>
      <Button
        shape={SHAPE.square}
        size={SIZE.mini}
        overrides={{ Root: { style: {
          fontWeight: 'bold',
          fontSize: '16pt'
        } } }}
        children={<span title='Редактировать'>✎</span>}
        onClick={() => setDialogIsOpen(true)}
      />
      {
        dialogIsOpen
        ? <Update.Dialog
            onSubmitted={() => setDialogIsOpen(false)}
            onCancel={() => setDialogIsOpen(false)}
            templateFile={templateFile}
          />
        : null
      }
    </>
  );
}


function RemoveButton({ templateFile, setRemovalDialogIsOpen }: Props) {
  const [dialogIsOpen, setDialogIsOpen] = React.useState(false);

  return (
    <>
      <Button
        shape={SHAPE.square}
        size={SIZE.mini}
        overrides={{ Root: { style: {
          fontWeight: 'bold',
          fontSize: '20pt'
        } } }}
        children={<span title='Удалить'>×</span>}
        onClick={() => {
          setDialogIsOpen(true);
          setRemovalDialogIsOpen(true);
        }}
      />
      {
        dialogIsOpen
        ? <Remove.Dialog
            onSubmitted={() => {
              setDialogIsOpen(false);
              setRemovalDialogIsOpen(false);
            }}
            onCancel={() => {
              setDialogIsOpen(false);
              setRemovalDialogIsOpen(false);
            }}
            templateFile={templateFile}
          />
        : null
      }
    </>
  );
}


function DownloadButton({ templateFile }: Props) {
  return (
    <Button
      shape={SHAPE.square}
      size={SIZE.mini}
      overrides={{ Root: { style: {
        fontWeight: 'bold',
        fontSize: '16pt'
      } } }}
      children={<span title='Скачать'>⤓</span>}
      $as='a'
      href={API_URL + '/print/raw/' + templateFile.id}
    />
  );
}


export function Actions(props: Props) {
  const [css] = useStyletron();

  return (
    <div className={css({
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr',
      gap: '0.5rem'
    })}>
      <UpdateButton {...props} />
      <RemoveButton {...props} />
      <DownloadButton {...props} />
    </div>
  );
}
