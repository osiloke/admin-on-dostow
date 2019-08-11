export const fetchJson = (url, options = {}) => {
  const requestHeaders = options.headers;

  return fetch(url, { ...options, headers: requestHeaders })
    .then(response =>
      response.text().then(text => ({
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        body: text
      }))
    )
    .then(({ status, statusText, headers, body }) => {
      let json;
      try {
        json = JSON.parse(body);
      } catch (e) {
        // not json, no big deal
      }
      if (status === 400) {
        return Promise.reject(new Error(json.msg, json.code));
      }
      if (status === 401) {
        return Promise.reject(new Error(json.msg, json.code));
      }
      return { status, headers, body, json };
    });
};

export const queryParameters = data => {
  const where = data.where
    ? [`q=${encodeURIComponent(JSON.stringify(data.where))}`]
    : [];
  delete data.where;
  const keys = Object.keys(data).map(key =>
    [key, data[key]].map(encodeURIComponent).join("=")
  );
  return [...where, ...keys].join("&");
};
