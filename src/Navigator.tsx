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
import { EXTERNAL_LINK_SYMBOL, MODAL_CLOSE_TIMEOUT_MS } from './util/constants';


function MobileMenu({ close }: { close: () => void }) {
  const history = useHistory();

  const [isOpen, setIsOpen] = React.useState(true);

  React.useEffect(() => {
    if (!isOpen) {
      setTimeout(close, MODAL_CLOSE_TIMEOUT_MS);
    }
  }, [isOpen, close]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      overrides={{
        Close: {
          component: () => null
        },
        Dialog: {
          style: {
            width: '70vw',
            textAlign: 'center'
          }
        }
      }}
    >
      <ModalHeader>Меню</ModalHeader>
      <ModalBody>
        <StatefulMenu
          overrides={{
            List: {
              style: {
                boxShadow: 'none'
              }
            },
            ListItem: {
              style: {
                padding: '1.5rem 0',
              }
            }
          }}
          items={ROUTES.map(({ title, path: href, external }) => ({
            label: external ? (title + ' ' + EXTERNAL_LINK_SYMBOL) : title,
            href
          }))}
          onItemSelect={({ item, event }) => {
            if (item.label.endsWith(EXTERNAL_LINK_SYMBOL)) {  // TODO: take out to util (EXTERNAL_LINK_SYMBOL const)
              // External link will be opened (in the same window)
            } else {
              event?.preventDefault();
              setIsOpen(false);
              history.push(item.href);
            }
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
        overrides={{
          Root: {
            style
          },
          NavItem: {
            style: {
              overflowWrap: 'anywhere'
            }
          }
        }}
        items={ROUTES.map(({ title, path: itemId, external }) => ({
          title: external ? (title + ' ' + EXTERNAL_LINK_SYMBOL) : title,
          itemId
        }))}
        activeItemId={ROUTES.find(r => location.pathname.startsWith(r.path))?.path ?? location.pathname}
        onChange={({ item, event }) => {
          if (item.title.endsWith(EXTERNAL_LINK_SYMBOL)) {  // TODO: take out to util (EXTERNAL_LINK_SYMBOL const)
            // External link will be opened (in the same window)
          } else {
            event.preventDefault();
            history.push(item.itemId);
          }
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
