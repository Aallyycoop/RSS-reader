import 'bootstrap';
import * as yup from 'yup';
import onChange from 'on-change';
import i18n from 'i18next';
import axios from 'axios';
import uniqueId from 'lodash/uniqueId.js';
import render from './view.js';
import ru from './locales/ru.js';
import parser from './parser.js';

const addProxy = (url) => {
  const urlWithProxy = new URL('https://allorigins.hexlet.app/get');
  urlWithProxy.searchParams.set('url', url);
  urlWithProxy.searchParams.set('disableCache', true);
  return urlWithProxy.toString();
};

const addPosts = (watchedState, posts) => {
  posts.forEach((post) => {
    const postId = post.postName;
    watchedState.posts.push({ ...post, id: postId });
  });
};

// Реализуйте код, который раз в 5 секунд проверяет каждый RSS-поток,
// и если он содержит новые посты, добавляет их в список.
// Добавлять нужно только новые посты. Проверяться должны все добавленные RSS-потоки.

// если добавятся новые посты, то произойдет рендерпостс, отображение уже просмотренных снимется?

const updateRss = (watchedState) => {
  watchedState.feeds.map(({ link }) => axios.get(addProxy(link))
    .then((response) => {
      const { posts } = parser(response.data.contents);
      const addedPosts = posts.map((post) => post.postLink);
      const filtered = watchedState.posts.filter(((post) => addedPosts.includes(post.postLink)));
      if (filtered.length === 0) {
        addPosts(watchedState, posts);
      }
    }));
  setTimeout(() => updateRss(watchedState), 5000);
  console.log('check');
};

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
    button: document.querySelector('button[type="submit"]'),
    feedbackEl: document.querySelector('.feedback'),
    feedsContainer: document.querySelector('.feeds'),
    postsContainer: document.querySelector('.posts'),
    modalTitle: document.querySelector('.modal-title'),
    modalBody: document.querySelector('.modal-body'),
    modalLink: document.querySelector('.modal-footer > .btn-primary'),
  };

  const initialState = {
    form: {
      state: 'filling', // success/failed
      error: null, // url/notOneOf/invalidRss/network
    },
    feeds: [],
    posts: [],
    uiState: {
      posts: [],
      modal: null,
    },
  };

  const watchedState = onChange(initialState, render(elements, i18nInstance, initialState));

  elements.formEl.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const url = data.get('url');
    const feedsLinks = watchedState.feeds.map(({ link }) => link);
    const schema = yup.string().trim().required().url()
      .notOneOf(feedsLinks);

    // watchedState.form.error = null;
    watchedState.form.state = 'pending';

    schema.validate(url)
      .then((urlData) => axios.get(addProxy(urlData)))
      .then((response) => {
        const { feed, posts } = parser(response.data.contents);
        const currentId = uniqueId();
        watchedState.form.state = 'success';
        watchedState.feeds.push({ ...feed, link: url, id: currentId });
        addPosts(watchedState, posts);
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
      });
    updateRss(watchedState);
  });

  elements.postsContainer.addEventListener('click', (e) => {
    const viewedPostId = e.target.dataset.id;
    if (viewedPostId) {
      watchedState.uiState.posts.push(viewedPostId);
    }

    if (e.target.tagName === 'BUTTON') {
      watchedState.uiState.modal = e.target.dataset.id;
    }
  });
};
