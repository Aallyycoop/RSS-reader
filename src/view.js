const renderFormState = (elements, i18nInstance, value) => {
  switch (value) {
    case 'success':
      elements.inputEl.classList.remove('is-invalid');
      elements.feedbackEl.classList.remove('text-danger');
      elements.feedbackEl.classList.add('text-success');
      elements.feedbackEl.textContent = i18nInstance.t('successValidation');
      elements.formEl.reset();
      elements.inputEl.focus();
      break;
    case 'failed':
      elements.inputEl.classList.add('is-invalid');
      elements.feedbackEl.classList.add('text-danger');
      break;
    default:
      throw new Error(`Unknown state: ${value}`);
  }
};

const renderFeeds = (elements, i18nInstance, feeds) => {
  const container = document.createElement('div');
  container.classList.add('card', 'border-0');
  const divTitle = document.createElement('div');
  divTitle.classList.add('card-body');
  const title = document.createElement('h2');
  title.classList.add('card-title', 'h4');
  title.textContent = i18nInstance.t('feeds');

  const listContainer = document.createElement('ul');
  listContainer.classList.add('list-group', 'border-0', 'rounded-0');

  elements.feedsContainer.innerHTML = '';

  divTitle.appendChild(title);
  container.appendChild(divTitle);

  feeds.forEach((feed) => {
    // console.log(feed);
    const cardFeed = document.createElement('li');
    cardFeed.classList.add('list-group-item', 'border-0', 'border-end-0');

    const titleFeed = document.createElement('h3');
    titleFeed.classList.add('h6', 'm-0');
    titleFeed.textContent = feed.title;

    const descriptionFeed = document.createElement('p');
    descriptionFeed.classList.add('m-0', 'small', 'text-black-50');
    descriptionFeed.textContent = feed.description;

    cardFeed.append(titleFeed, descriptionFeed);
    listContainer.appendChild(cardFeed);
    // console.log(listContainer);
  });

  elements.feedsContainer.appendChild(container);
  elements.feedsContainer.appendChild(listContainer);
};

// const renderPosts = (elements, i18nInstance, feeds) => {

// };

const renderError = (elements, i18nInstance, error) => {
  // elements.feedbackEl.classList.add('text-danger');
  // elements.inputEl.classList.add('is-invalid');
//   if (error === 'url') {
//     elements.feedbackEl.textContent = i18nInstance.t('validationErrors.url');
//   }
//   if (error === 'notOneOf') {
//     elements.feedbackEl.textContent = i18nInstance.t('validationErrors.notOneOf');
//   }
  switch (error) {
    case 'url': {
      elements.feedbackEl.textContent = i18nInstance.t('validationErrors.url');
      break;
    }
    case 'notOneOf': {
      elements.feedbackEl.textContent = i18nInstance.t('validationErrors.notOneOf');
      break;
    }
    case 'invalidRss': {
      elements.feedbackEl.textContent = i18nInstance.t('parseError');
      break;
    }
    default:
  }
  console.log(error);
};

const render = (elements, i18nInstance) => (path, value) => {
  switch (path) {
    case 'form.error': {
      renderError(elements, i18nInstance, value);
      break;
    }
    case 'form.state': {
      renderFormState(elements, i18nInstance, value);
      break;
    }
    case 'feeds': {
      renderFeeds(elements, i18nInstance, value);
      // console.log(`смотрю3 ${value}`);
      break;
    }
    default:
      throw new Error(`Unknown path: ${path}`);
  }
};

export default render;
