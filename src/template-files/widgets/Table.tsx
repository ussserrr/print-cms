import * as React from 'react';

import _ from 'lodash';

import { DateTime } from 'luxon';

import { TableBuilder, TableBuilderColumn } from 'baseui/table-semantic';
import { Checkbox } from 'baseui/checkbox';

import { CombinedError } from 'urql';

import * as gqlSchema from 'src/graphql-schema';
import { ServiceConfigContext } from 'src/config/data';
import Loader from 'src/util/widgets/Loader';
import { Actions } from './Actions';


type Props = {
  data: gqlSchema.TemplateFile[];
  isLoading?: boolean;
  error?: CombinedError;
  setSomeFileRemovalDialogIsOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  onCurrentFileChanged?: (id?: string) => void;
}

export function Table({
  data,
  isLoading,
  error,
  setSomeFileRemovalDialogIsOpen,
  onCurrentFileChanged
}: Props) {
  const serviceConfig = React.useContext(ServiceConfigContext);
  let filesToKeep = '';
  if ('loading' in serviceConfig) {
    filesToKeep = '⌛';
  } else if ('error' in serviceConfig) {
    filesToKeep = '⚠️';
  } else {
    filesToKeep = serviceConfig.filesToKeep.toString();
  }

  const [removalDialogsOpenState, setRemovalDialogOpenState] = React.useState<boolean[]>([]);
  React.useEffect(() => {
    if (setSomeFileRemovalDialogIsOpen) {
      setSomeFileRemovalDialogIsOpen(removalDialogsOpenState.some(v => v));
    }
  }, [setSomeFileRemovalDialogIsOpen, removalDialogsOpenState]);


  return (
    <TableBuilder
      data={data}
      isLoading={isLoading ?? false}
      emptyMessage={
        error
        ? <span style={{color: 'red'}}>{error.message}</span>
        : <span style={{color: 'GrayText'}}>
            У данного шаблона нет файлов. Добавьте один с помощью кнопки выше.
            Пустые шаблоны по-умолчанию неактивны и не показываются в выдаче на печать.
            Допускается хранение до {filesToKeep} файлов на один шаблон, далее самые старые файлы будут вытеснены
          </span>
      }
      loadingMessage={<Loader/>}
      overrides={{
        TableBodyCell: {
          style: {
            verticalAlign: 'middle'
          }
        }
      }}
    >
      <TableBuilderColumn header='Текущий?'
        children={(row: gqlSchema.TemplateFile) =>
          <Checkbox
            name={row.id}
            checked={row.isCurrentFileOfItsType}
            onChange={event => {
              const { name: id, checked } = event.currentTarget;
              if (onCurrentFileChanged) {
                onCurrentFileChanged(checked ? id : undefined);
              }
            }}
          />
        }
      />
      <TableBuilderColumn header='Действия'
        children={(row: gqlSchema.TemplateFile, rowIndex) =>
          <Actions
            templateFile={row}
            setRemovalDialogIsOpen={flag => {
              const newVal = _.clone(removalDialogsOpenState);
              if (rowIndex !== undefined) newVal[rowIndex] = flag;
              setRemovalDialogOpenState(newVal);
            }}
          />
        }
      />
      <TableBuilderColumn header='Название'
        children={(row: gqlSchema.TemplateFile) => row.title} />
      <TableBuilderColumn header='Тип'
        children={(row: gqlSchema.TemplateFile) => row.mimeType} />
      <TableBuilderColumn header='Изменен'
        children={(row: gqlSchema.TemplateFile) =>
          DateTime.fromISO(row.updatedAt as unknown as string).toLocaleString(DateTime.DATETIME_MED)
        } />
    </TableBuilder>
  );
}
