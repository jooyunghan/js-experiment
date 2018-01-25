const HashMap = require("./HashMap");
require("./Array.flatMap");

function Request(request) {
  if (!(this instanceof Request)) return new Request(request);
  this.request = request;
}

/**
 * @typedef {{request: Request, box: any[]}} BlockedRequest
 * @typedef {{done: any}|{blocked: BlockedRequest[], next: ()=>any}} Result
 *
 * @param {HashMap} cache
 * @param {any[]} stack
 * @param {*} result
 * @returns {Result}
 */
function step(cache, stack, result) {
  while (stack.length > 0) {
    const top = stack.pop();
    if (top instanceof Request) {
      const { request } = top;
      if (cache.has(request)) {
        const box = cache.get(request);
        if (box.length > 0) {
          result = box[0];
        } else {
          return {
            blocked: [],
            next: () => step(cache, stack, box[0]),
          };
        }
      } else {
        const box = [];
        cache.put(request, box);
        return {
          blocked: [{ request, box }],
          next: () => step(cache, stack, box[0]),
        };
      }
    } else if (Array.isArray(top)) {
      // Here comes "concurrency"
      // The array should contains 'executable's only
      const arrayResult = top.map(v => step(cache, [v]));
      if (arrayResult.every(r => "done" in r)) {
        result = arrayResult.map(r => r.done);
      } else {
        return {
          blocked: arrayResult.flatMap(br => br.blocked || []),
          next: function next() {
            // For every 'blocked' operation, proceed it to next
            for (let i in arrayResult) {
              if ("blocked" in arrayResult[i]) {
                arrayResult[i] = arrayResult[i].next();
              }
            }
            if (arrayResult.every(r => "done" in r)) {
              return step(cache, stack, arrayResult.map(r => r.done));
            } else {
              return {
                blocked: arrayResult.flatMap(br => br.blocked || []),
                next: next,
              };
            }
          },
        };
      }
    } else if (typeof top.next === "function") {
      const { value, done } = top.next(result);
      if (done) {
        result = value;
      } else {
        stack.push(top);
        stack.push(value);
      }
    } else {
      throw new Error("Can't handle: " + top);
    }
  }
  return { done: result };
}

/**
 * @param {GeneratorFunction} g
 * @param {(requests: BlockedRequest[]) => Promise} fetch
 * @returns {Promise}
 */
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
