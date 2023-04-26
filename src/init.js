import 'bootstrap';
import * as yup from 'yup';
import onChange from 'on-change';
import i18n from 'i18next';
import axios from 'axios';
import uniqueId from 'lodash/uniqueId.js';
import render from './view.js';
import ru from './locales/ru.js';
import parser from './parser.js';
// import { WatchIgnorePlugin } from 'webpack';

const getUrl = (url) => `https://allorigins.hexlet.app/get?disableCache=true&url=${url}`;

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
    feedsContainer: document.querySelector('.feeds'),
    postsContainer: document.querySelector('.posts'),
  };

  const initialState = {
    form: {
      state: 'filling', // success/failed
      error: null, // url/notOneOf/invalidRss/network
    },
    feeds: [],
    posts: [],
  };

  const watchedState = onChange(initialState, render(elements, i18nInstance));

  elements.formEl.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const url = data.get('url');
    const feedsLinks = watchedState.feeds.map(({ link }) => link);
    const schema = yup.string().trim().required().url()
      .notOneOf(feedsLinks);

    watchedState.form.error = null;

    schema.validate(url)
      .then((urlData) => axios.get(getUrl(urlData)))
      .then((response) => {
        const { feed, posts } = parser(response.data.contents);
        // console.log({ feed, posts });
        const currentId = uniqueId();
        // console.log(parsedData);
        // console.log(response);
        watchedState.form.state = 'success';
        watchedState.feeds.push({ ...feed, link: url, id: currentId });
        watchedState.posts.push(...posts);
        // const postsWithId = posts.map((post) => ({ ...post, id: currentId }));
        // watchedState.posts.push(postsWithId);
        // console.log(watchedState);
      })
      .catch((error) => {
        if (error.name === 'ValidationError') {
          watchedState.form.error = error.type;
        } else if (error.name === 'AxiosError') {
          watchedState.form.error = 'network';
        } else {
          watchedState.form.error = 'invalidRss';
        }
        watchedState.form.state = 'failed';
        console.log(error.name, error);
        // console.log(error.type);
      });
  });
};
