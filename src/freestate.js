const { More, Done } = require("./free");
const Unit = require("./unit");
const range = require("./range");

class StateF {
  map(f) {
    if (this instanceof Get) {
      return new Get(s => f(this.f(s)));
    } else {
      return new Put(this.s, f(this.a));
    }
  }
}

class Get extends StateF {
  constructor(f) {
    super();
    this.f = f;
  }
}

class Put extends StateF {
  constructor(s, a) {
    super();
    this.s = s;
    this.a = a;
  }
}

function pureState(a) {
  return new Done(a);
}

function getState() {
  return new More(new Get(s => new Done(s)));
}

function setState(s) {
  return new More(new Put(s, new Done(Unit)));
}

function evalS(s, t) {
  while (true) {
    const r = t.resume();

    if (r.isLeft()) {
      if (r.value instanceof Get) {
        t = r.value.f(s);
      } else {
        s = r.value.s;
        t = r.value.a;
      }
    } else {
      return r.value;
    }
  }
}

function zipIndex(as) {
  return evalS(
    0,
    as.reduce((acc, a) => {
      return acc.flatMap(xs => {
        return getState().flatMap(n => {
          return setState(n + 1).map(() => xs.concat({ value: a, index: n }));
        });
      });
    }, pureState([]))
  );
}

console.log(zipIndex(range(0, 3)));
