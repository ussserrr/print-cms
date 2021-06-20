import * as React from 'react';

import { useStyletron } from 'styletron-react';
import { Button, SHAPE, SIZE } from 'baseui/button';

import * as gqlSchema from 'src/graphql-schema';
import * as Update from './dialogs/Update';
import * as Remove from './dialogs/Remove';


type Props = {
  templateFile: gqlSchema.TemplateFile;
}


function UpdateButton({ templateFile }: Props) {
  const [dialogIsOpen, setDialogIsOpen] = React.useState(false);

  return (
    <React.Fragment>
      <Button shape={SHAPE.square} size={SIZE.mini}
        overrides={{ Root: { style: { fontWeight: 'bold', fontSize: '16pt' } } }}
        children={<span title='Редактировать'>✎</span>}
        onClick={() => setDialogIsOpen(true)}
      />
      {
        dialogIsOpen
        ? <Update.Dialog
            onSubmitted={() => {
              setDialogIsOpen(false);
            }}
            onCancel={() => setDialogIsOpen(false)}
            templateFile={templateFile}
          />
        : null
      }
    </React.Fragment>
  );
}


function RemoveButton({ templateFile }: Props) {
  const [dialogIsOpen, setDialogIsOpen] = React.useState(false);

  return (
    <React.Fragment>
      <Button shape={SHAPE.square} size={SIZE.mini}
        overrides={{ Root: { style: { fontWeight: 'bold', fontSize: '20pt' } } }}
        children={<span title='Удалить'>×</span>}
        onClick={() => setDialogIsOpen(true)}
      />
      {
        dialogIsOpen
        ? <Remove.Dialog
            onSubmitted={() => {
              try {  // this item, as we execute the removal operation, can be not existing at this point
                setDialogIsOpen(false)
              } catch {};
            }}
            onCancel={() => setDialogIsOpen(false)}
            templateFile={templateFile}
          />
        : null
      }
    </React.Fragment>
  );
}


function DownloadButton({ templateFile }: Props) {
  return (
    <Button shape={SHAPE.square} size={SIZE.mini}
      overrides={{ Root: { style: { fontWeight: 'bold', fontSize: '16pt' } } }}
      children={<span title='Скачать'>⤓</span>}
      $as='a' href={'http://192.168.1.214:4000/print/raw/' + templateFile.id}
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
