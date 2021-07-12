/**
 * Generic dialog for some data model instance creating/updating/removing.
 *
 * It wraps generic EntityActionForm into Base Web Modal component. It manages its own
 * open/close state so corresponding animations has a chance to complete. However, if
 * the executed mutation will violate internal urql cache some component up in the DOM
 * tree can be removed/rerendered before the animation stops.
 *
 * When "subclassing" this dialog, it is often convenient to extend only PublicProps
 * and pass all other props as predefined values (we probably know what exactly we're
 * create/update/remove).
 *
 * When "Submit" button is pressed, onSubmit callback is calling so the parent can
 * validate a form and set GraphQL vars to start the mutation.
 */

import * as React from 'react';

import type { StyleObject } from 'styletron-react';
import { useStyletron } from 'baseui';
import { Modal, ModalHeader, ModalBody, ModalFooter, ModalButton, CLOSE_SOURCE, ROLE } from 'baseui/modal';
import { KIND } from 'baseui/button';

import { useMutation } from 'urql';

import _ from 'lodash';

import { MODAL_CLOSE_TIMEOUT } from '../constants';
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

  let action = 'Выполнить действие';
  switch (mode) {
    case 'create': action = 'Добавить'; break;
    case 'update': action = 'Изменить'; break;
    case 'remove': action = 'Удалить'; break;
  }

  let _title = action;
  if (what?.length) {
    _title += ` ${what}`;
  }
  const [title] = React.useState(_title);  // "freeze" an initial calculated value

  let role;  // not sure what it gives...
  if (mode === 'remove') {
    role = ROLE.alertdialog;
  } else {
    role = ROLE.dialog;
  }

  const submitButtonOverrides = _.set({}, 'BaseButton.props.type', 'submit');
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
    setTimeout(() => onCancelPassed(args), MODAL_CLOSE_TIMEOUT);
  }

  const [{fetching, data, error, extensions}, mutate] = useMutation<ResultData, MutationVars>(query);

  React.useEffect(() => {  // execute the mutation when a parent sets variables
    if (vars) {
      mutate(vars);  // remove "vars" to quickly test an error appearance :)
    }
  }, [vars, mutate]);

  React.useEffect(() => {  // close on success i.e. when some data is returned from the mutation
    if (data) {
      setIsOpen(false);
      setTimeout(() => onSubmitted(data), MODAL_CLOSE_TIMEOUT);
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
