import * as React from 'react';

import type { ButtonOverrides } from 'baseui/button';
import { Button, KIND } from 'baseui/button';
import { Modal, ModalHeader, ModalBody } from 'baseui/modal';
import { Paragraph2 } from 'baseui/typography';

import { MODAL_CLOSE_TIMEOUT } from 'src/util/constants';


export default function HelpButton({ overrides }: { overrides?: ButtonOverrides }) {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isDialogRendered, setIsDialogRendered] = React.useState(false);

  return (
    <>
      <Button
        kind={KIND.secondary}
        overrides={overrides}
        onClick={() => {
          setIsDialogRendered(true);
          setIsDialogOpen(true);
        }}
      >
        ❓ Справка
      </Button>
      {
        isDialogRendered
        ? <Modal
            isOpen={isDialogOpen}
            onClose={() => {
              setIsDialogOpen(false);
              setTimeout(setIsDialogRendered, MODAL_CLOSE_TIMEOUT, false);
            }}
          >
            <ModalHeader>Нагрузочное тестирование</ModalHeader>
            <ModalBody>
              <Paragraph2>
                В этом режиме в указанных пределах длительности временнóго окна в случайный момент времени отправляется
                запрос на печать случайно выбранного активного печатного шаблона (без передачи данных подстановки). В
                качестве ID пользователя, сделавшего запрос, указывается случайно сгенерированное число (оно остается
                постоянным до перезагрузки страницы).
              </Paragraph2>
              <Paragraph2>
                Таким образом эмулируется функционирование сервиса в "рабочем" режиме. Для воссоздания
                многопользовательской конфигурации можно открыть несколько вкладок, где каждая из них будет представлять
                отдельного пользователя. Комбинируя таким образом количество пользователей и ширину временнóго окна
                можно оценить стабильность работы сервиса.
              </Paragraph2>
              <Paragraph2>
                Результаты тестирования отображаются в таблице. Желтый цвет строки обозначает отправленный запрос
                (ожидание ответа/результата от сервиса), зеленый – успешное его выполнение, тогда как красный
                сигнализирует об ошибке. Нажмите на название шаблона чтобы открыть готовый PDF-рендер либо прочитать
                причину сбоя.
              </Paragraph2>
            </ModalBody>
          </Modal>
        : null
      }
    </>
  );
}
