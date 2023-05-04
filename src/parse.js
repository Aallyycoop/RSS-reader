export default (data) => {
  const parser = new DOMParser();

  try {
    const parsedData = parser.parseFromString(data, 'application/xml');

    // парсинг фида
    const title = parsedData.querySelector('title').textContent;
    const description = parsedData.querySelector('description').textContent;

    // парсинг постов
    const posts = parsedData.querySelectorAll('item');
    const items = Array.from(posts).map((item) => ({
      title: item.querySelector('title').textContent,
      link: item.querySelector('link').textContent,
      description: item.querySelector('description').textContent,
    }));
    const feed = { title, description, items };
    return feed;
  } catch (e) {
    throw new Error('parseError');
  }
};
