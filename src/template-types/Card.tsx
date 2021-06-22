import * as React from 'react';

import _ from 'lodash';

import { useHistory, useLocation, useParams } from 'react-router-dom';

import { useStyletron } from 'baseui';
import { Button } from 'baseui/button';

import { gql, useQuery } from 'urql';

import * as gqlSchema from 'src/graphql-schema';
import { useSize } from 'src/util/Hooks';
import { useBreadcrumbs } from 'src/Breadcrumbs';
import TablePreHeader from 'src/util/TablePreHeader';
import Loader from 'src/util/Loader';
import ErrorsList from 'src/util/ErrorsList';
import * as Create from 'src/template-files/dialogs/Create';
import { Table } from 'src/template-files/Table';
import * as Update from './forms/Update';
import * as Remove from './dialogs/Remove';


const KEY = 'Шаблон';

const STYLE = {
  flex: '1 0 auto'
};


interface TemplateTypeData {
  templateType: gqlSchema.TemplateType;
}

interface QueryVars {
  id: string;
}

const TEMPLATE_TYPE = gql`
  query GetTemplateTypeById($id: ID!) {
    templateType(id: $id) {
      id
      owner
      title
      active
      pageOfFiles {
        total
        items {
          id
          title
          mimeType
          isCurrentFileOfItsType
          updatedAt
        }
      }
    }
  }
`;


export function Card() {
  const { templateTypeId } = useParams<{templateTypeId: string}>();

  const history = useHistory();
  const location = useLocation();

  const [css] = useStyletron();
  const size = useSize();

  const [files, setFiles] = React.useState<gqlSchema.TemplateFile[]>([]);
  const [currentFileId, setCurrentFileId] = React.useState<string>();
  const [currentFileIdTouched, setCurrentFileIdTouched] = React.useState<boolean>(false);

  const [removeDialogIsOpen, setRemoveDialogIsOpen] = React.useState(false);

  const [{ data, fetching, error, stale }] = useQuery<TemplateTypeData, QueryVars>({
    query: TEMPLATE_TYPE,
    variables: { id: templateTypeId },
    pause: removeDialogIsOpen
  });

  useBreadcrumbs(KEY, data?.templateType?.title ?? KEY);

  React.useEffect(() => {
    setFiles(data?.templateType?.pageOfFiles?.items ?? []);
    setCurrentFileIdTouched(false);
    setCurrentFileId(data?.templateType?.pageOfFiles?.items?.find(file => file.isCurrentFileOfItsType)?.id);
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
                    setRemoveDialogIsOpen(false)
                    history.push(location.pathname.substring(0, location.pathname.lastIndexOf('/')));  // TODO: test when ALL queries/mutations are slow (Chrome DevTools or in server)
                    // if (onRemove) onRemove();
                    // try {  // this item, as we execute the removal operation, can be not existing at this point
                    // } catch {};
                  }}
                  onCancel={() => setRemoveDialogIsOpen(false)}
                  templateType={data.templateType}
                />
              : null
            }
          </div>

          <TablePreHeader<Create.Props>
            title='Файлы'
            createDialog={Create.Dialog}
            createDialogProps={{
              forTemplateType: data.templateType
            }}
          />

          <Table
            data={files}
            onCurrentFileChanged={newCurrentFileId => {
              const newValue = _.cloneDeep(files);
              newValue.forEach(file => {
                file.isCurrentFileOfItsType = (file.id === newCurrentFileId);
              })
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
