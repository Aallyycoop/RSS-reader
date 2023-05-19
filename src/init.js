import 'bootstrap';
import * as yup from 'yup';
import onChange from 'on-change';
import i18n from 'i18next';
import axios from 'axios';
import render from './view.js';
import resources from './locales/index.js';
import parse from './parse.js';

const addProxy = (url) => {
  const urlWithProxy = new URL('https://allorigins.hexlet.app/get');
  urlWithProxy.searchParams.set('url', url);
  urlWithProxy.searchParams.set('disableCache', true);
  return urlWithProxy.toString();
};

const validate = (feedsLinks, url) => {
  const schema = yup.string().trim().required().url()
    .notOneOf(feedsLinks);
  return schema.validate(url);
};

const addId = (items, feedId) => items
  .map((post) => {
    const postId = post.title;
    return { ...post, feedId, id: postId };
  });

const updateRss = (watchedState) => {
  const promises = watchedState.feeds.map(({ link }) => axios.get(addProxy(link))
    .then((response) => {
      const { feed, items } = parse(response.data.contents);
      const feedId = feed.title;
      const addedPosts = watchedState.posts.map((post) => post.link);
      const filtered = items.filter(((post) => !addedPosts.includes(post.link)));
      if (filtered.length !== 0) {
        const postsWithId = addId(filtered, feedId);
        watchedState.posts.unshift(...postsWithId);
      }
    })
    .catch(console.error));
  const updateTime = 5000;
  Promise.all(promises).finally(setTimeout(() => updateRss(watchedState), updateTime));
};

export default async () => {
  const defaultLanguage = 'ru';
  const i18nInstance = i18n.createInstance();
  await i18nInstance.init({
    lng: defaultLanguage,
    debug: false,
    resources,
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
      status: 'filling', // process/failed
      error: null, // url/notOneOf
    },
    loadingProcess: {
      status: 'idle', // loading/success/failed
      error: null, // invalidRss/network
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

    watchedState.form = { ...watchedState.form, status: 'process' };
    watchedState.loadingProcess = { ...watchedState.loadingProcess, status: 'loading' };

    const data = new FormData(e.target);
    const url = data.get('url');
    const feedsLinks = watchedState.feeds.map(({ link }) => link);

    validate(feedsLinks, url)
      .then((urlData) => axios.get(addProxy(urlData)))
      .then((response) => {
        const { feed, items } = parse(response.data.contents);
        const feedId = feed.title;
        watchedState.feeds.push({ ...feed, link: url, id: feedId });
        const postsWithId = addId(items, feedId);
        watchedState.posts.unshift(...postsWithId);

        watchedState.form = { ...watchedState.form, error: null };
        watchedState.loadingProcess = { status: 'success', error: null };
      })
      .catch((error) => {
        console.log(error);
        switch (error.name) {
          case 'ValidationError': {
            watchedState.form = { status: 'failed', error: error.type };
            break;
          }
          case 'AxiosError': {
            watchedState.loadingProcess = { status: 'failed', error: 'network' };
            break;
          }
          case 'Error': {
            if (error.isParsingError) {
              watchedState.loadingProcess = { status: 'failed', error: 'parseError' };
            }
            break;
          }
          default:
            watchedState.loadingProcess = { status: 'failed', error: 'unknownError' };
        }
      });
  });

  updateRss(watchedState);

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
