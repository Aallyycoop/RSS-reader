export default (elements, i18nInstance) => (path, value) => {
  switch (path) {
    case 'form.error': {
      elements.inputEl.classList.add('is-invalid');
      elements.feedbackEl.classList.add('text-danger');
      if (value[0].type === 'url') {
        elements.feedbackEl.textContent = i18nInstance.t('validationErrors.url');
        // elements.feedbackEl.textContent = value[0].message;
        // console.log(value[0].message);
        console.log(value);
      }
      if (value[0].type === 'notOneOf') {
        elements.feedbackEl.textContent = i18nInstance.t('validationErrors.notOneOf');
      }
      break;
    }
    case 'feeds': {
      elements.inputEl.classList.remove('is-invalid');
      elements.feedbackEl.classList.remove('text-danger');
      elements.feedbackEl.classList.add('text-success');
      elements.feedbackEl.textContent = i18nInstance.t('successValidation');
      // console.log(value);
      elements.formEl.reset();
      elements.inputEl.focus();
      break;
    }
    default:
      throw new Error(`Unknown path: ${path}`);
  }
};
