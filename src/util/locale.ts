import { LocaleProviderProps } from 'baseui';

const locale: LocaleProviderProps['locale'] = {
  fileuploader: {
    dropFilesToUpload: 'Перетяните сюда файл для загрузки',
    or: 'или...',
    browseFiles: 'Выберите файл',
    retry: 'Повторить',
    cancel: 'Отмена'
  },
  pagination: {
    prev: 'Пред.',
    next: 'След.',
    preposition: 'из'
  },
  select: {
    noResultsMsg: 'Не найдено',
    placeholder: 'Выбрать...',
    create: 'Создать'
  }
};

export default locale;
