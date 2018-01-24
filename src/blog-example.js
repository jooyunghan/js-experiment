const counter = require("./counter");
const zip = require("./zip");
const {runFetch} = require('./fetch');
const api = require("./blog-api")

function* blogExample() {
  const [left, main] = yield [leftPane(), mainPane()];
  return renderPage(left, main);
}

function* leftPane() {
  const [pop, top] = yield [popularPosts(), topics()];
  return renderSidePane(pop, top);
}

function* mainPane() {
  const posts = yield getAllPostsInfo();
  posts.sort((a, b) => a.postDate - b.postDate);
  const ordered = posts.slice(0, 5);
  const content = yield ordered.map(p => api.getPostContent(p.id));
  return renderPosts(zip(ordered, content));
}

function* getAllPostsInfo() {
  const ids = yield api.getPostIds();
  const infos = yield ids.map(api.getPostInfo);
  return infos;
}

function* getPostDetails(id) {
  return yield [api.getPostInfo(id), api.getPostContent(id)];
}

function* popularPosts() {
  const ids = yield api.getPostIds();
  const views = yield ids.map(api.getPostViews);
  const zipped = zip(ids, views);
  zipped.sort((a, b) => b[1] - a[1]);
  const ordered = zipped.map(a => a[0]).slice(0, 5);
  const content = yield ordered.map(getPostDetails);
  return renderPostList(content);
}

function* topics() {
  const posts = yield getAllPostsInfo();
  return renderTopics(counter(posts, p => p.topic));
}

const posts = [
  {
    id: 1,
    views: 12,
    postDate: 10,
    topic: "fp",
  },
  {
    id: 2,
    views: 11,
    postDate: 1,
    topic: "oop",
  },
  {
    id: 3,
    views: 1,
    postDate: 2,
    topic: "fp",
  },
  {
    id: 4,
    views: 22,
    postDate: 3,
    topic: "fp",
  },
  {
    id: 5,
    views: 3,
    postDate: 4,
    topic: "algo",
  },
  {
    id: 6,
    views: 121,
    postDate: 5,
    topic: "fp",
  },
];

function renderTopics(topics) {
  const keys = Object.keys(topics);
  keys.sort((a, b) => topics[b] - topics[a]);
  return keys.map(k => ({ topic: k, count: topics[k] }));
}

function renderPage(left, main) {
  return { left, main };
}

function renderSidePane(popular, topics) {
  return { popular, topics };
}

function renderPostList(posts) {
  return posts.map(([info, content]) => ({ info, content }));
}

function renderPosts(posts) {
  return posts.map(([info, content]) => ({ info, content }));
}

function process(requests) {
  requests.forEach(({ request, box }) => {
    if (request.type === "getPostIds") {
      box.push(posts.map(p => p.id));
    } else if (request.type === "getPostViews") {
      box.push(posts.filter(p => p.id === request.id).map(p => p.views)[0]);
    } else if (request.type === "getPostInfo") {
      box.push(posts.filter(p => p.id === request.id)[0]);
    } else if (request.type === "getPostContent") {
      box.push(`content of post id = ${request.id}`);
    } else {
      console.log("Can't handle", request);
    }
  });
  return Promise.resolve();
}

runFetch(blogExample, process).then(x =>
  console.log(JSON.stringify(x, null, 2))
);
