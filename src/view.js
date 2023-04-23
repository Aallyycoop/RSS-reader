export default (elements) => (path, value) => {
  switch (path) {
    case 'form.error': {
      elements.inputEl.classList.add('is-invalid');
      elements.feedbackEl.classList.add('text-danger');
      elements.feedbackEl.textContent = value[0].message;
      console.log(value);
      break;
    }
    case 'feeds': {
      elements.inputEl.classList.remove('is-invalid');
      elements.feedbackEl.classList.remove('text-danger');
      elements.feedbackEl.classList.add('text-success');
      elements.feedbackEl.textContent = 'RSS успешно загружен';
      // console.log(value);
      elements.formEl.reset();
      elements.inputEl.focus();
      break;
    }
    default:
      throw new Error(`Unknown path: ${path}`);
  }
};
