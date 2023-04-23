import 'bootstrap';
import * as yup from 'yup';
import onChange from 'on-change';
import render from './view.js';

export default () => {
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

  const watchedState = onChange(initialState, render(elements));

  elements.formEl.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const url = data.get('url');
    const schema = yup.string().trim().required().url()
      .notOneOf(initialState.feeds, 'RSS уже существует');

    schema.validate(url)
      .then((urlData) => {
        watchedState.feeds = [...watchedState.feeds, urlData];
      })
      .catch((error) => {
        watchedState.form.error = [error];
        console.log([error]);
      });
    console.log(watchedState);
  });
};
