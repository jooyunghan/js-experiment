const { Request } = require("./fetch");

const getPostIds = () => Request({ type: "getPostIds" });
const getPostViews = id => Request({ type: "getPostViews", id });
const getPostContent = id => Request({ type: "getPostContent", id });
const getPostInfo = id => Request({ type: "getPostInfo", id });

module.exports = {
  getPostIds,
  getPostViews,
  getPostContent,
  getPostInfo,
};
