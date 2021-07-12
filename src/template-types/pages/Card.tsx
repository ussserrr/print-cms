import * as React from 'react';

import type { RouteComponentProps } from 'react-router-dom';
import { useParams } from 'react-router-dom';

import { useStyletron } from 'baseui';
import { Button } from 'baseui/button';

import { useQuery } from 'urql';

import _ from 'lodash';

import * as gqlSchema from 'src/graphql-schema';
import { useScreenSize } from 'src/util/hooks';
import TablePreHeader from 'src/util/widgets/TablePreHeader';
import Loader from 'src/util/widgets/Loader';
import ErrorsList from 'src/util/widgets/ErrorsList';

import * as CreateFileDialog from 'src/template-files/dialogs/Create';
import { Table as FilesTable } from 'src/template-files/widgets/Table';

import * as Update from '../forms/Update';
import * as Remove from '../dialogs/Remove';
import type { GetData, GetVars } from '../data';
import { GetQuery } from '../data';


const STYLE = {
  flex: '1 0 auto'
};


export function Card({ history, location }: RouteComponentProps) {
  const params = useParams<{id: string}>();

  const [css] = useStyletron();
  const size = useScreenSize();

  const [files, setFiles] = React.useState<gqlSchema.TemplateFile[]>([]);
  const [currentFileId, setCurrentFileId] = React.useState<string>();
  const [currentFileIdTouched, setCurrentFileIdTouched] = React.useState<boolean>(false);

  const shouldCreateFileOnOpen = (location.state as any)?.createFile ? true : false;
  const [firstFileCreated, setFirstFileCreated] = React.useState<boolean>(false);
  const [removeDialogIsOpen, setRemoveDialogIsOpen] = React.useState(false);
  const [someFileRemoveDialogIsOpen, setSomeFileRemoveDialogIsOpen] = React.useState(false);

  const [{ data, fetching, error, stale }] = useQuery<GetData, GetVars>({
    query: GetQuery,
    variables: params,
    pause: removeDialogIsOpen || someFileRemoveDialogIsOpen
  });

  React.useEffect(() => {
    const files = data?.templateType?.pageOfFiles?.items;
    setFiles(files ?? []);
    setCurrentFileIdTouched(false);
    setCurrentFileId(files?.find(file => file.isCurrentFileOfItsType)?.id);
  }, [data]);


  if (error) {
    return <ErrorsList error={error} />;
  } else if (fetching) {
    return <Loader style={STYLE}/>;
  } else if (data?.templateType) {
    return (
      <>
        {
          stale ? <Loader style={STYLE} /> : null
        }
        <div className={css({
          display: stale ? 'none' : 'block',
          ...STYLE
        })}>
          <div className={css({
            display: 'flex',
            marginBlockEnd: '1rem',
            ...(size > 720
              ? {
                flexWrap: 'wrap',
                alignItems: 'start'
              }
              : {
                flexDirection: 'column'
              })
          })}>
            <Update.Form
              containerStyle={{
                ...((size > 720) ? {
                  flexGrow: 1
                } : {})
              }}
              formStyle={{
                display: 'flex',
                ...((size > 720) ? {
                  margin: '0 0.25rem 0.25rem 0',
                  flexWrap: 'wrap',
                  alignItems: 'start'
                } : {
                  flexDirection: 'column',
                  marginBlockEnd: '0.5rem'
                })
              }}
              templateType={data.templateType}
              currentFileId={currentFileId}
              currentFileIdTouched={currentFileIdTouched}
              shouldActivate={
                shouldCreateFileOnOpen &&
                firstFileCreated &&
                files.length === 1 &&
                Boolean(currentFileId)
              }
            />

            <Button
              overrides={{
                Root: {
                  style: ({ $theme }) => ({
                    backgroundColor: $theme.colors.contentNegative,
                    marginBlockEnd: '1rem'
                  })
                }
              }}
              onClick={() => setRemoveDialogIsOpen(true)}
            >
              Удалить
            </Button>
            {
              removeDialogIsOpen
              ? <Remove.Dialog
                  onSubmitted={() => {
                    setRemoveDialogIsOpen(false);
                    const path = location.pathname;
                    history.push(path.substring(0, path.lastIndexOf('/')));
                  }}
                  onCancel={() => setRemoveDialogIsOpen(false)}
                  templateType={data.templateType}
                />
              : null
            }
          </div>

          <TablePreHeader<CreateFileDialog.Props>
            title='Файлы'
            dialogIsOpenInitially={shouldCreateFileOnOpen}
            onCreated={() => setFirstFileCreated(true)}
            createDialog={CreateFileDialog.Dialog}
            createDialogProps={{ forTemplateType: data.templateType }}
          />

          <FilesTable
            data={files}
            setSomeFileRemoveDialogIsOpen={setSomeFileRemoveDialogIsOpen}
            onCurrentFileChanged={newCurrentFileId => {
              const newValue = _.cloneDeep(files);
              newValue.forEach(file =>
                file.isCurrentFileOfItsType = (file.id === newCurrentFileId)
              );
              setFiles(newValue);
              setCurrentFileId(newCurrentFileId);
              setCurrentFileIdTouched(true);
            }}
          />
        </div>
      </>
    );
  } else {
    return null;
  }
}
