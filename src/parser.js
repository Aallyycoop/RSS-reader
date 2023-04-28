export default (data) => {
  const parser = new DOMParser();
  const parsedData = parser.parseFromString(data, 'application/xml');

  // парсинг фида
  const title = parsedData.querySelector('title').textContent;
  const description = parsedData.querySelector('description').textContent;
  const feed = { title, description };

  // парсинг постов
  const items = parsedData.querySelectorAll('item');
  const posts = Array.from(items).map((item) => {
    const postName = item.querySelector('title').textContent;
    const postLink = item.querySelector('link').textContent;
    const postDescription = item.querySelector('description').textContent;
    return { postName, postLink, postDescription };
  });

  return { feed, posts };
};

// ? При возникновении ошибки парсинга приложение должно её корректно обрабатывать
// ? и показывать сообщение в интерфейсе
