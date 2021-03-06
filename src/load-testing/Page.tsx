/**
 * Improvements:
 *  - show stats (total, average speed of serving, how many has errored, etc.)
 *  - results filtering (show only errors, etc.)
 *  - efficient results displaying (show only last 10 and render others on demand, and so on)
 *  - clear button
 *  - export results
 *  - save settings for the session (like list filters)
 *  - show the error for errored jobs
 */

import React from 'react';

import { DateTime } from 'luxon';

import { useStyletron } from 'baseui';
import { Button, KIND as ButtonKind } from 'baseui/button';
import { FormControl } from 'baseui/form-control';
import { Slider } from 'baseui/slider';
import { ListItem, ListItemLabel } from 'baseui/list';
import { toaster } from 'baseui/toast';
import { Paragraph2 } from 'baseui/typography';
import { Notification, KIND as NotificationKind } from 'baseui/notification';
import { StatefulTooltip } from 'baseui/tooltip';

import { useQuery } from 'urql';

import { API_URL } from 'src/util/constants';
import { useScreenSize } from 'src/util/hooks';
import type { FindData, FindVars } from 'src/template-types/data';
import { FindQuery } from 'src/template-types/data';

import { print } from './data';
import type { PrintRequest } from './data';
import HelpButton from './widgets/HelpButton';
import ResultsTable from './widgets/ResultsTable';


const USER_ID = Math.floor(Math.random() * 10000);
const REQUESTS_TIMER_WINDOW_DEFAULT = 20;  // seconds
const TIME_TO_NEXT_REQUEST_RENDER_INTERVAL = 100;  // ms


export function LoadTesting() {
  const [css] = useStyletron();
  const screenSize = useScreenSize();

  const [timeToNextRequest, setTimeToNextRequest] = React.useState<number>();  // ms
  const [requestsTimerWindow, setRequestsTimerWindow] = React.useState(REQUESTS_TIMER_WINDOW_DEFAULT);  // seconds
  const [sseInstance, setSseInstance] = React.useState<EventSource>();
  const [sseState, setSseState] = React.useState(EventSource.CONNECTING);
  const [requestsTimerId, setRequestsTimerId] = React.useState<number>();
  const [timeToNextRequestTimerId, setTimeToNextRequestTimerId] = React.useState<number>();
  const [requestsHistory, setRequestsHistory] = React.useState<PrintRequest[]>([]);


  const [{ data: templatesData, error: templatesError }, getTemplates] = useQuery<FindData, FindVars>({
    query: FindQuery,
    variables: { filter: { active: true } },
    pause: true,
    requestPolicy: 'network-only'
  });
  const templates = templatesData?.templateTypes.items;

  React.useEffect(() => {
    if (templatesError) {
      toaster.negative('???????????? ?????????????? ???????????????? ????????????????: ' + templatesError.message, {});
    }
  }, [templatesError]);


  const makeRequestAndPlanNext = () => {
    if (templates?.length) {
      // Randomly pick a template
      const template = templates[Math.floor(Math.random() * templates.length)];

      // Asynchronously print it
      print({ ...template, userId: USER_ID }).then(({ data, error }) => {
        if (data?.printTemplateType.token) {
          Object.assign(newHistoryEntry, {  // modify an existing entry
            state: 'REGISTERED',
            registeredAt: DateTime.now(),
            token: data.printTemplateType.token
          });
        } else if (error) {
          Object.assign(newHistoryEntry, {  // modify an existing entry
            state: 'ERROR',
            errorAt: DateTime.now(),
            error
          });
        }
        setRequestsHistory(current => Array.from(current));
      });

      // Create an associated history entry
      const newHistoryEntry: PrintRequest = {
        state: 'REQUESTED',
        requestedAt: DateTime.now(),
        template
      };

      // Update the history
      setRequestsHistory(current => current.concat(newHistoryEntry));

      // Plan the next request
      runRequestsTimer();
    }
  }

  const runRequestsTimer = () => {
    const newTimeout = Math.floor(Math.random() * requestsTimerWindow * 1000);
    const timer = window.setTimeout(makeRequestAndPlanNext, newTimeout);
    setTimeToNextRequest(newTimeout);
    setRequestsTimerId(timer);
    // console.log('Requests timer started, id:', timer, 'timeout:', newTimeout);
  }

  const stopRequestTimer = React.useCallback(() => {
    window.clearTimeout(requestsTimerId);
    // console.log('Requests timer cleared, id:', requestsTimerId);
    setTimeToNextRequest(undefined);
    setRequestsTimerId(undefined);
  }, [requestsTimerId]);

  const toggleRequestsTimer = () => {
    if (requestsTimerId) {
      stopRequestTimer();
    } else {
      makeRequestAndPlanNext();
    }
  }


  const disablingReasons = [{
    condition: !templates?.length,
    description: '?????????????????????? ???????????????????? ??????????????'
  }, {
    condition: sseState !== EventSource.OPEN,
    description: 'SSE-?????????????????????? ??????????????????????'
  }, {
    condition: !sseInstance?.url.endsWith(USER_ID.toString()),
    description: 'UserID ???????????????? SSE-???????????????????? ?? ?????????????????????????????? ???? ??????????????????'
  }];


  /**
   * Server-sent events (SSE)
   */
  React.useEffect(() => {
    if (!sseInstance) {
      // console.log('Setup SSE...');
      const sse = new EventSource(API_URL + '/print/sse?userId=' + USER_ID.toString());
      setSseInstance(sse);
      sse.addEventListener('open', () => {
        setSseState(EventSource.OPEN);
        getTemplates();
      });
      sse.addEventListener('error', () => setSseState(EventSource.CONNECTING));
      sse.addEventListener('message', event => {
        /**
         * TODO:
         * If the result is an error and it was too fast then this handler will fire BEFORE
         * the setRequestsHistory() so the event's token will not be found in the history and
         * the corresponding UI element will not reflect the state appropriately (it will show
         * REQUESTED stage forever for this entry)
         */
        const doneAt = DateTime.now();
        const data = JSON.parse(event.data);
        const token = data.token;
        if (token) {
          setRequestsHistory(history => {
            // Searching in the reversed order is much faster in our case: the incoming result
            // is most likely to be requested recently and therefore is located somewhere near
            // the tail of the history array
            let associatedHistoryRequest;
            for (let idx = history.length - 1; idx >= 0; idx--) {
              const request = history[idx];
              if (request.state === 'REGISTERED' && request.token === token) {
                associatedHistoryRequest = request;
                break;
              }
            }
            if (associatedHistoryRequest) {
              Object.assign(associatedHistoryRequest, {  // update the corresponding history entry
                state: 'DONE',
                doneAt,
                message: data
              });
            } else {
              console.error(
                'Cannot found any request in history associated with the incoming SSE event',
                event
              );
            }
            // Return the same array, just updating the reference link (so React can react)
            return Array.from(history);
          })
        }
      });
    }
    /**
     * TODO: Implement correct teardown process (sseInstance.close();)
     */
  }, [sseInstance, requestsHistory, getTemplates]);

  React.useEffect(() => {
    if (sseState === EventSource.CONNECTING) {
      // Doesn't work if placed inside "error" SSE event listener (see effect above)
      // so need to define this dedicated effect
      stopRequestTimer();
    }
  }, [sseState, stopRequestTimer]);


  /**
   * Show user a time to the next request (calculate and update it using setInterval)
   */
  React.useEffect(() => {
    if (requestsTimerId && !timeToNextRequestTimerId) {
      const timeToNextRequestTimerId = window.setInterval(
        setTimeToNextRequest,
        TIME_TO_NEXT_REQUEST_RENDER_INTERVAL,
        (current: number) =>
          current >= TIME_TO_NEXT_REQUEST_RENDER_INTERVAL
          ? (current - TIME_TO_NEXT_REQUEST_RENDER_INTERVAL)
          : current
      );
      setTimeToNextRequestTimerId(timeToNextRequestTimerId);
      // console.log('Time-to-next-request timer registered, id:', timeToNextRequestTimerId);
    } else if (!requestsTimerId && timeToNextRequestTimerId) {
      window.clearInterval(timeToNextRequestTimerId);
      // console.log('Time-to-next-request timer cleared, id:', timeToNextRequestTimerId);
      setTimeToNextRequestTimerId(undefined);
    }
  }, [requestsTimerId, timeToNextRequestTimerId]);


  const PlayButton =
    <Button
      disabled={disablingReasons.some(reason => reason.condition)}
      onClick={toggleRequestsTimer}
      kind={requestsTimerId === undefined ? ButtonKind.secondary : ButtonKind.primary}
      overrides={{ Root: { style: { width: '10rem' }}}}
    >
      {requestsTimerId === undefined ? '?????? ????????????' : '??? ????????????????????'}
    </Button>;


  return (
    <div className={css({                       // Container
      ...((screenSize > 640) ? {
        height: '85vh',  // hacky
        display: 'flex',
        flexDirection: 'column',
        paddingBlockEnd: '30px'
      } : {})
    })}>
      <div className={css({                     // Header (controls, some stats)
        display: 'flex',
        marginBlockEnd: '2rem',
        ...((screenSize > 640) ? {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        } : {
          flexDirection: 'column'
        })
      })}>
        <div className={css({                   // Controls
          ...((screenSize > 640) ? {
            width: '58%'
          } : {})
        })}>
          <div className={css({                 // Buttons
            display: 'flex',
            justifyContent: 'space-between',
            marginBlockEnd: '2rem'
          })}>
            {
              disablingReasons.some(reason => reason.condition)
              ? <StatefulTooltip
                  accessibilityType='tooltip'
                  onMouseEnterDelay={0}
                  onMouseLeaveDelay={0}
                  content={
                    <Notification kind={NotificationKind.negative}>
                      <ul className={css({ margin: 0 })}>{disablingReasons
                        .filter(reason => reason.condition)
                        .map((reason, idx) => <li key={idx}>{reason.description}</li>)
                      }</ul>
                    </Notification>
                  }
                >
                  <div>{PlayButton}</div>
                </StatefulTooltip>
              : PlayButton
            }

            <HelpButton overrides={{ Root: { style: { width: '10rem' }}}} />
          </div>

          <div>{/*                              // Slider (timer window)           */}
            <FormControl
              label='???????????????????????? ???????? ??????????????, ??'
              caption={
                timeToNextRequest === undefined
                ? null
                : `?????????????????? ???????????? ??????????: ${(timeToNextRequest / 1000).toFixed(1)} ??`
              }
              disabled={requestsTimerId !== undefined}
            >
              <Slider
                min={5} max={60}
                value={[requestsTimerWindow]}
                onChange={({ value }) => value && setRequestsTimerWindow(value[0])}
              />
            </FormControl>
          </div>
        </div>

        <div className={css({                   // Stats
          ...((screenSize > 640) ? {
            width: '38%'
          } : {})
        })}>
          <ul className={css({
            padding: 0,
            margin: 0
          })}>
            <ListItem endEnhancer={() => {      // User ID
              if (sseInstance?.url.endsWith(USER_ID.toString())) {
                return <Paragraph2>{USER_ID}</Paragraph2>;
              } else if (sseInstance) {
                return <Paragraph2 color='negative'>???? ??????????????????. ?????????????????????????? ????????????????</Paragraph2>;
              } else return null;
            }} >
              <ListItemLabel>????????????-UserID</ListItemLabel>
            </ListItem>
            <ListItem endEnhancer={() => {      // SSE state
              switch (sseState) {
                case EventSource.CONNECTING:
                  return <Paragraph2 color='warning'>??????????????????????...</Paragraph2>;
                case EventSource.OPEN:
                  return <Paragraph2>????????????????????</Paragraph2>;
                case EventSource.CLOSED:
                  return <Paragraph2 color='negative'>??????????????????</Paragraph2>;
              }
            }} >
              <ListItemLabel>?????????????????? SSE</ListItemLabel>
            </ListItem>
          </ul>
        </div>
      </div>

      <ResultsTable                             // Results table
        requestsHistory={requestsHistory}
        requestsTimerId={requestsTimerId}
      />
    </div>
  );
}
