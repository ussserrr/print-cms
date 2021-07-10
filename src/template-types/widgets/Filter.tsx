import * as React from 'react';

import { StyleObject } from 'styletron-standard';
import { useStyletron } from 'baseui';
import { Search, Delete, Alert } from 'baseui/icon';
import { Input } from 'baseui/input';
import { Checkbox, LABEL_PLACEMENT } from 'baseui/checkbox';
import { Select, Value } from 'baseui/select';
import { Pagination } from 'baseui/pagination';
import { Button, KIND as ButtonKind, SHAPE } from 'baseui/button';
import { StatefulTooltip } from 'baseui/tooltip';
import { Notification, KIND as NotificationKind } from 'baseui/notification';

import { useFormik } from 'formik';

import * as gqlSchema from 'src/graphql-schema';
import { ServiceConfigContext } from 'src/config';
import type { FindVars } from '../data';


const MARGIN = '1rem';
const ITEM_MARGIN = `0 ${MARGIN} ${MARGIN} 0`;
const INPUT_STYLE = {
  minWidth: '200px',
  width: '20%',
  maxWidth: '300px',
  margin: ITEM_MARGIN
};

const DEFAULT_PAGE_SIZE = 10;

const STORAGE_KEY = 'template-types-list-vars';

function getDefaultVars(pageSize: number = DEFAULT_PAGE_SIZE): Required<FindVars> {
  return {
    filter: {
      common: {
        search: undefined
      },
      active: true
    },
    options: {
      page: {
        limit: pageSize,
        offset: 0
      }
    }
  };
}

function retrieveSessionVars(pageSize: number = DEFAULT_PAGE_SIZE): Required<FindVars> {
  const varsJSON = sessionStorage.getItem(STORAGE_KEY);
  return varsJSON ? (JSON.parse(varsJSON) as Required<FindVars>) : getDefaultVars(pageSize);
}

function saveSessionVars(vars: Required<FindVars>) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(vars));
}

function clearSessionVars() {
  sessionStorage.removeItem(STORAGE_KEY);
}

function varsToForm(
  { filter, options }: Required<FindVars>,
  pageSize: number = DEFAULT_PAGE_SIZE
): FormData {
  return {
    search: filter.common?.search ?? '',
    active: filter.active ?? true,
    owners: filter.owners?.length ? filter.owners.map(v => ({id: v})) : [],
    page: ((options.page?.offset ?? 0) / (options.page?.limit ?? pageSize)) + 1
  };
}

function formToVars(value: FormData, pageSize: number = DEFAULT_PAGE_SIZE): Required<FindVars> {
  return {
    filter: {
      common: {
        search: value.search ? value.search : undefined
      },
      active: value.active,
      owners: value.owners?.length ? value.owners.map(v => v.id as gqlSchema.Owner) : undefined
    },
    options: {
      page: {
        limit: pageSize,
        offset: ((value.page ?? 1) - 1) * pageSize
      }
    }
  };
}

type FormData = {
  search?: string;
  active?: boolean;
  owners?: Value;
  page?: number;
}

type Props = {
  pageSize?: number;
  total: number;
  onFilter: (query: Required<FindVars>) => any;
  style?: StyleObject;
}


export function Filter({ pageSize=DEFAULT_PAGE_SIZE, total, onFilter, style}: Props) {
  const [css, theme] = useStyletron();

  const totalPages = Math.ceil(total / pageSize);

  const formik = useFormik<FormData>({
    initialValues: varsToForm(getDefaultVars()),
    validate: values => {
      const errors: Partial<Record<keyof FormData, string>> = {};

      if (values.search?.length && values.search.length < 3) {
        errors.search = 'от 3-х символов';
      }

      return errors;
    },
    onReset: () => {
      onFilter(formToVars(formik.initialValues));
      clearSessionVars();
    },
    onSubmit: values => {
      const vars = formToVars(values);
      saveSessionVars(vars);
      onFilter(vars);
    }
  });

  const [isMounted, setIsMounted] = React.useState(false);
  React.useEffect(() => {
    if (!isMounted) {
      setIsMounted(true);
      const initialVars = retrieveSessionVars(pageSize);
      formik.setValues(varsToForm(initialVars));
      onFilter(initialVars);
    }
  }, [isMounted, pageSize, formik, onFilter]);

  const serviceConfig = React.useContext(ServiceConfigContext);
  const owners = 'owners' in serviceConfig ? serviceConfig.owners : undefined;

  const OwnersSelect =
    <Select
      disabled={owners === undefined}
      options={owners}
      placeholder='Для...'
      value={formik.values.owners}
      onChange={({ value }) => {
        if (value.length) {
          formik.setFieldValue('owners', value);
        } else {
          formik.setFieldValue('owners', []);
        }
      }}
      overrides={{
        Root: {
          style: INPUT_STYLE
        },
        SelectArrow: {
          props: {
            title: 'Открыть'
          }
        },
        ClearIcon: {
          props: {
            title: 'Очистить'
          }
        }
      }}
    />;


  return (
    <form
      onSubmit={formik.handleSubmit}
      onReset={formik.handleReset}
      className={css({
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        ...style
      })}
    >
      <Input
        name='search'
        placeholder='От 3-х знаков...'
        value={formik.values.search}
        onChange={formik.handleChange}
        onBlur={e => formik.setFieldTouched('search', true)}
        error={formik.touched.search && Boolean(formik.errors.search)}
        endEnhancer={
          (formik.touched.search && Boolean(formik.errors.search))
          ? <div
              className={css({
                display: 'flex',
                alignItems: 'center',
                color: theme.colors.contentNegative,
              })}
            >
              <Alert size='18px' />
            </div>
          : <Search size='18px' title='Поиск' />
        }
        clearable={true}
        clearOnEscape={false}
        overrides={{
          Root: {
            style: INPUT_STYLE
          },
          ClearIcon: {
            props: {
              title: 'Очистить'
            }
          }
        }}
      />

      {
        owners === undefined
        ? <StatefulTooltip
            accessibilityType='tooltip'
            onMouseEnterDelay={0}
            onMouseLeaveDelay={0}
            content={
              'error' in serviceConfig
              ? <Notification kind={NotificationKind.negative}>
                  Ошибка получения от сервиса возможных владельцев
                </Notification>
              : <Notification kind={NotificationKind.info}>
                  Загрузка возможных владельцев...
                </Notification>
            }
          >
            <div>{OwnersSelect}</div>
          </StatefulTooltip>
        : OwnersSelect
      }

      <Checkbox
        name='active'
        checked={formik.values.active}
        onChange={formik.handleChange}
        labelPlacement={LABEL_PLACEMENT.right}
        overrides={{
          Root: {
            style: {
              margin: ITEM_MARGIN
            }
          }
        }}
      >
        Активные
      </Checkbox>

      <div className={css({
        display: 'flex',
        margin: `0 auto ${MARGIN} 0`
      })}>
        <Button type='submit' shape={SHAPE.square} kind={ButtonKind.secondary}
          onClick={e => formik.setFieldValue('page', 1)}  // reset the page before submit
          overrides={{ Root: { style: { marginRight: '0.25rem' } }}}
        >
          <Search size={20} title='Искать' />
        </Button>
        <Button type='reset' shape={SHAPE.square} kind={ButtonKind.secondary}>
          <Delete size={20} title='Сбросить фильтр' />
        </Button>
      </div>

      <Pagination
        numPages={totalPages}
        currentPage={formik.values.page ?? 1}
        onPageChange={({ nextPage }) => {
          const page = Math.min(Math.max(nextPage, 1), totalPages);  // reset the page before submit
          formik.setFieldValue('page', page);
          formik.handleSubmit();
        }}
        overrides={{
          Root: {
            style: {
              marginBottom: MARGIN
            }
          },
          Select: {
            props: {
              overrides: {
                SelectArrow: {
                  props: {
                    title: 'Открыть'
                  }
                }
              }
            }
          },
          PrevButton: {
            style: {
              height: theme.sizing.scale1200  // 48px as for all other elements
            },
            props: {
              type: 'button'  // for formik
            }
          },
          NextButton: {
            style: {
              height: theme.sizing.scale1200  // 48px as for all other elements
            },
            props: {
              type: 'button'  // for formik
            }
          },
        }}
      />
    </form>
  );
}
