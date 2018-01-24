const HashMap = require("./HashMap");

function Request(request) {
  return Object.setPrototypeOf(request, Request.prototype);
}

function handleRequest(cache, stack, request) {
  if (cache.has(request)) {
    const box = cache.get(request);
    if (box.length > 0) {
      return { done: box[0] };
    } else {
      return {
        blocked: [],
        next: () => step(cache, stack, box[0]),
      };
    }
  }
  const box = [];
  cache.put(request, box);
  return {
    blocked: [{ request, box }],
    next: () => step(cache, stack, box[0]),
  };
}

function step(cache, stack, result) {
  while (stack.length > 0) {
    const i = stack.pop();
    if (i instanceof Request) {
      const r = handleRequest(cache, stack, i);
      if ("done" in r) {
        result = r.done;
        continue;
      } else {
        return r;
      }
    }
    const { value, done } = i.next(result);
    if (done) {
      result = value;
    } else if (typeof value.next === "function") {
      stack.push(i);
      stack.push(value);
    } else if (value instanceof Request) {
      stack.push(i);
      const r = handleRequest(cache, stack, value);
      if ("done" in r) {
        result = r.done;
      } else {
        return r;
      }
    } else if (value instanceof Array) {
      stack.push(i);
      const result2 = [];
      for (const v of value) {
        result2.push(step(cache, [v]));
      }
      if (result2.every(r => "done" in r)) {
        result = result2.map(r => r.done);
      } else {
        const blocked = result2
          .filter(r => "blocked" in r)
          .reduce((a, r) => a.concat(r.blocked), []);
        return {
          blocked,
          next: function next() {
            for (let i in result2) {
              if ("blocked" in result2[i]) {
                result2[i] = result2[i].next();
              }
            }
            if (result2.every(r => "done" in r)) {
              return step(cache, stack, result2.map(r => r.done));
            } else {
              const blocked = result2
                .filter(r => "blocked" in r)
                .reduce((a, r) => a.concat(r.blocked), []);
              return {
                blocked,
                next: next,
              };
            }
          },
        };
      }
    }
  }
  return { done: result };
}

function runFetch(g, fetch) {
  let round = 1;

  function go(cont) {
    const r = cont();

    if ("done" in r) {
      return Promise.resolve(r.done);
    } else {
      console.log(`============ ROUND #${round++}  ============`);
      r.blocked.forEach((req, i) => console.log(i, req.request));
      return fetch(r.blocked).then(() => go(r.next));
    }
  }

  return go(() => step(new HashMap(), [g()]));
}

module.exports = {
  runFetch,
  Request,
};
