import * as React from 'react';

import type { RouteComponentProps } from 'react-router-dom';

import type { History } from 'history';

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

import { ROUTES } from './routes2';
import { useScreenSize } from './util/Hooks';
import { EXTERNAL_LINK_SYMBOL, MODAL_CLOSE_TIMEOUT_MS } from './util/constants';


const SIDEBAR_ROUTES = ROUTES.slice(0, ROUTES.length - 1);  // exclude NotFound page


function MobileMenu({ close, history }: { close: () => void, history: History }) {
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
      unstable_ModalBackdropScroll={true}  // TODO
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
              style: {  // verbose form to prevent console warnings
                paddingTop: '1.5rem',
                paddingBottom: '1.5rem',
                paddingLeft: '0',
                paddingRight: '0'
              }
            }
          }}
          items={
            SIDEBAR_ROUTES
              .map(({ title, path: href, external }) => ({
                label: external ? (title + ' ' + EXTERNAL_LINK_SYMBOL) : title,
                href
              }))
          }
          onItemSelect={({ item, event }) => {
            if (item.label.endsWith(EXTERNAL_LINK_SYMBOL)) {
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


type Props = {
  style?: StyleObject
} & RouteComponentProps;

export function Navigator({ style, match, history }: Props) {
  const size = useScreenSize();

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
        items={
          SIDEBAR_ROUTES
            .map(({ title, path: itemId, external }) => ({
              title: external ? (title + ' ' + EXTERNAL_LINK_SYMBOL) : title,
              itemId
            }))
        }
        activeItemId={match.path}
        onChange={({ item, event }) => {
          if (item.title.endsWith(EXTERNAL_LINK_SYMBOL)) {
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
            {/* TODO: why Popover? for what? */}
            <StatefulPopover content={({ close }) => <MobileMenu close={close} history={history} />} >
              <Button overrides={{ Root: { props: { title: 'Меню' } } }}>
                ☰ Меню
              </Button>
            </StatefulPopover>
          </StyledNavigationItem>
        </StyledNavigationList>
      </HeaderNavigation>
  );
}
