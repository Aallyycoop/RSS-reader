// export default (data) => {
//   const parser = new DOMParser();

//   try {
//     const parsedData = parser.parseFromString(data, 'application/xml');
//     console.log(parsedData);

//     // парсинг фида
//     const title = parsedData.querySelector('title').textContent;
//     const description = parsedData.querySelector('description').textContent;
//     const feed = { title, description };

//     // парсинг постов
//     const items = parsedData.querySelectorAll('item');
//     const posts = Array.from(items).map((item) => {
//       const name = item.querySelector('title').textContent;
//       const link = item.querySelector('link').textContent;
//       const description = item.querySelector('description').textContent;
//       return { name, link, description };
//     });
//     return { feed, posts };
//   } catch (e) {
//     throw new Error('invalidRss');
//   }
// };

export default (data) => {
  const parser = new DOMParser();

  try {
    const parsedData = parser.parseFromString(data, 'application/xml');
    console.log(parsedData);

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
