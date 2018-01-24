function* dataFetch(request) {
  let box = [];
  let br = { request, box };
  yield Blocked([br]);
  return box[0];
}

function runFetch(g, fetch) {
  function step(stack, result) {
    while (stack.length > 0) {
      const i = stack.pop();
      const { value, done } = i.next(result);
      if (done) {
        result = value;
      } else if (typeof value.next === "function") {
        stack.push(i);
        stack.push(value);
      } else if (value instanceof Blocked) {
        stack.push(i);
        return {
          blocked: value.requests,
          next: () => step(stack),
        };
      } else if (value instanceof Array) {
        stack.push(i);
        let result2 = [];
        for (const v of value) {
          result2.push(step([v]));
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
                return step(stack, result2.map(r => r.done));
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
    return {
      done: result,
    };
  }

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

  return go(() => step([g()]));
}

function Blocked(requests) {
  return Object.assign(Object.create(Blocked.prototype), { requests });
}

module.exports = {
  runFetch,
  dataFetch
}