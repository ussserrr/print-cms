import * as React from 'react';

import _ from 'lodash';

import { StyleObject } from 'styletron-react';
import { useStyletron } from 'baseui';
import { Modal, ModalHeader, ModalBody, ModalFooter, ModalButton, CLOSE_SOURCE, ROLE } from 'baseui/modal';
import { KIND } from 'baseui/button';

import { useMutation } from 'urql';

import { MODAL_CLOSE_TIMEOUT_MS } from '../constants';
import { EntityActionForm } from './EntityActionForm';


type Mode = 'create' | 'update' | 'remove';
type CancelHandler = (args: {closeSource?: CLOSE_SOURCE[keyof CLOSE_SOURCE] | 'cancelButton'}) => any;

export interface PublicProps<ResultData = any> {
  onSubmitted: (data: ResultData) => void;
  onCancel: CancelHandler;
}

interface Props<MutationVars, ResultData> extends PublicProps<ResultData> {
  mode: Mode;
  what?: string;
  formStyle?: StyleObject;
  formContent?: React.ReactNode | (() => React.ReactNode);
  query: Parameters<typeof useMutation>[0];
  vars?: MutationVars;
  onSubmit: () => void;
}


export function EntityActionDialog<MutationVars = any, ResultData = any>({
  onSubmitted,
  onCancel: onCancelPassed,
  mode,
  what,
  formStyle,
  formContent,
  query,
  vars,
  onSubmit
}: Props<MutationVars, ResultData>) {
  const [, theme] = useStyletron();

  let action: string;
  switch (mode) {
    case 'create':
      action = 'Добавить';
      break;
    case 'update':
      action = 'Изменить';
      break;
    case 'remove':
      action = 'Удалить';
      break;
    default:
      action = 'Выполнить действие';
      break;
  }

  let _title = action;
  if (what?.length) {
    _title += ` ${what}`;
  }
  const [title] = React.useState(_title);

  let role;
  if (mode === 'remove') {
    role = ROLE.alertdialog;
  } else {
    role = ROLE.dialog;
  }

  let submitButtonOverrides = _.set({}, 'BaseButton.props.type', 'submit');
  switch (mode) {
    case 'create':
      _.set(submitButtonOverrides, 'BaseButton.style.backgroundColor', theme.colors.contentPositive);
      break;
    case 'update':
      _.set(submitButtonOverrides, 'BaseButton.style.backgroundColor', theme.colors.contentAccent);
      break;
    case 'remove':
      _.set(submitButtonOverrides, 'BaseButton.style.backgroundColor', theme.colors.contentNegative);
      break;
  }

  const [isOpen, setIsOpen] = React.useState(true);
  const onCancel: CancelHandler = (args) => {
    setIsOpen(false);
    setTimeout(() => onCancelPassed(args), MODAL_CLOSE_TIMEOUT_MS);
  }

  const [{fetching, data, error, extensions}, mutate] = useMutation<ResultData, MutationVars>(query);

  React.useEffect(() => {
    if (vars) {
      mutate(
        vars  // comment this to quickly test an error appearance :)
      );
    }
  }, [vars, mutate]);

  React.useEffect(() => {
    if (data) {
      setIsOpen(false);
      setTimeout(() => onSubmitted(data), MODAL_CLOSE_TIMEOUT_MS);
    }
  }, [data, onSubmitted]);


  return (
    <Modal
      role={role}
      onClose={onCancel}
      isOpen={isOpen}
      unstable_ModalBackdropScroll={true}  // TODO
    >
      <ModalHeader>{title}</ModalHeader>

      <ModalBody>
        <EntityActionForm
          actionTitle={title}
          formStyle={formStyle}
          formContent={formContent}
          data={data}
          error={error}
          extensions={extensions}
        />
      </ModalBody>

      <ModalFooter>
        <ModalButton
          kind={KIND.tertiary}
          onClick={() => onCancel({ closeSource: 'cancelButton' })}
        >
          Отмена
        </ModalButton>
        <ModalButton
          isLoading={fetching}
          disabled={fetching}
          overrides={submitButtonOverrides}
          onClick={onSubmit}
        >
          {action}
        </ModalButton>
      </ModalFooter>
    </Modal>
  );
}
