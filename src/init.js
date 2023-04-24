import 'bootstrap';
import * as yup from 'yup';
import onChange from 'on-change';
import i18n from 'i18next';
import render from './view.js';
import ru from './locales/ru.js';

export default async () => {
  const defaultLanguage = 'ru';
  const i18nInstance = i18n.createInstance();
  await i18nInstance.init({
    lng: defaultLanguage,
    debug: false,
    resources: {
      ru,
    },
  });

  const elements = {
    formEl: document.querySelector('.rss-form'),
    inputEl: document.querySelector('.form-control'),
    feedbackEl: document.querySelector('.feedback'),
  };

  const initialState = {
    form: {
      state: 'filling',
      error: null,
    },
    feeds: [],
    posts: [],
  };

  const watchedState = onChange(initialState, render(elements, i18nInstance));

  elements.formEl.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const url = data.get('url');
    const schema = yup.string().trim().required().url()
      .notOneOf(initialState.feeds);
      // .notOneOf(initialState.feeds, i18nInstance.t('validationErrors.notOneOf'));

    // schema.validate('').then((data) => console.log(data)).catch((error) => console.log(error));

    schema.validate(url)
      .then((urlData) => {
        watchedState.feeds = [...watchedState.feeds, urlData];
      })
      .catch((error) => {
        watchedState.form.error = [error];
        // console.log([error]);
      });
    // console.log(watchedState);
  });
};
