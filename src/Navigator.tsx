import * as React from 'react';

import { useHistory, useLocation } from 'react-router-dom';

import { StyleObject } from 'styletron-standard';
import { Navigation } from 'baseui/side-navigation';
import {
  HeaderNavigation,
  ALIGN,
  StyledNavigationList,
  StyledNavigationItem
} from 'baseui/header-navigation';
import { StatefulPopover } from 'baseui/popover';
import { Button } from 'baseui/button';
import { Modal, ModalBody, ModalHeader } from 'baseui/modal';
import { StatefulMenu } from 'baseui/menu';

import { ROUTES } from './routes';
import { useSize } from './util/Hooks';


function MobileMenu({ close }: { close: () => void }) {
  const history = useHistory();

  const [isOpen, setIsOpen] = React.useState(true);

  React.useEffect(() => {
    if (!isOpen) {
      setTimeout(close, 500);
    }
  }, [isOpen, close]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
    >
      <ModalHeader>Меню</ModalHeader>
      <ModalBody>
        <StatefulMenu
          items={ROUTES.map(({ title: label, path: href }) => ({ label, href }))}
          onItemSelect={({ item, event }) => {
            event?.preventDefault();
            setIsOpen(false);
            history.push(item.href);
          }}
        />
      </ModalBody>
    </Modal>
  );
}


export function Navigator({ style }: { style?: StyleObject }) {
  const history = useHistory();
  const location = useLocation();

  const size = useSize();

  return (
    (size > 640)

    ? <Navigation
        overrides={{ Root: { style } }}
        items={ROUTES.map(({ title, path: itemId }) => ({ title, itemId }))}
        activeItemId={ROUTES.find(r => location.pathname.startsWith(r.path))?.path ?? location.pathname}
        onChange={({ item, event }) => {
          event.preventDefault();
          history.push(item.itemId);
        }}
      />

    : <HeaderNavigation>
        <StyledNavigationList>
          <StyledNavigationItem $align={ALIGN.left}>
            <StatefulPopover content={({ close }) => <MobileMenu close={close} />} >
              <Button overrides={{ Root: { props: { title: 'Меню' } } }}>
                ☰ Меню
              </Button>
            </StatefulPopover>
          </StyledNavigationItem>
        </StyledNavigationList>
      </HeaderNavigation>
  );
}
