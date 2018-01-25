const HashMap = require("./HashMap");
require("./Array.flatMap");

function Request(request) {
  return Object.setPrototypeOf(request, Request.prototype);
}

function step(cache, stack, result) {
  while (stack.length > 0) {
    const i = stack.pop();
    if (i instanceof Request) {
      if (cache.has(i)) {
        const box = cache.get(i);
        if (box.length > 0) {
          result = box[0];
          continue;
        }
        return {
          blocked: [],
          next: () => step(cache, stack, box[0]),
        };
      }
      const box = [];
      cache.put(i, box);
      return {
        blocked: [{ request: i, box }],
        next: () => step(cache, stack, box[0]),
      };
    } else if (i instanceof Array) {
      const arrayResult = i.map(v => step(cache, [v]));
      if (arrayResult.every(r => "done" in r)) {
        result = arrayResult.map(r => r.done);
        continue;
      }
      return {
        blocked: arrayResult.flatMap(br => br.blocked || []),
        next: function next() {
          for (let i in arrayResult) {
            if ("blocked" in arrayResult[i]) {
              arrayResult[i] = arrayResult[i].next();
            }
          }
          if (arrayResult.every(r => "done" in r)) {
            return step(cache, stack, arrayResult.map(r => r.done));
          }
          return {
            blocked: arrayResult.flatMap(br => br.blocked || []),
            next: next,
          };
        },
      };
    } else if (typeof i.next === "function") {
      const { value, done } = i.next(result);
      if (done) {
        result = value;
      } else {
        stack.push(i);
        stack.push(value);
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
