exports.parseOffset = query => {
  query.page = Number.parseInt(query.page);
  query.page = Number.isSafeInteger(query.page) ? query.page : 0;
  return query.page * exports.parsePageLimit(query);
};

exports.parsePageLimit = query => {
  const limit = Number.parseInt(query.limit);
  if (Number.isInteger(limit)) return limit;

  const environmentLimit = Number.parseInt(process.env.DEFAULT_ITEMS_PER_PAGE);

  if (Number.isInteger(environmentLimit)) return environmentLimit;

  // return hardcoded limit in case environment vars are not set up correctly.
  return 8;
};
