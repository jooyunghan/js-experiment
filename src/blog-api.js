const { dataFetch } = require("./fetch");

const getPostIds = () => dataFetch({ type: "getPostIds" });
const getPostViews = id => dataFetch({ type: "getPostViews", id });
const getPostContent = id => dataFetch({ type: "getPostContent", id });
const getPostInfo = id => dataFetch({ type: "getPostInfo", id });

module.exports = {
  getPostIds,
  getPostViews,
  getPostContent,
  getPostInfo,
};
