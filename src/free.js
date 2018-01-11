const {right, left} = require("./either");

class Free {
  resume() {
    let cur = this;
    while (true) {
      if (cur instanceof Done) {
        return right(cur.v);
      } else if (cur instanceof More) {
        return left(cur.k);
      } else {
        const {sub:af, f} = cur;
        const a = af(); // force delayed sub
        if (a instanceof Done) {
          const {v} = a;
          cur = f(v);
        } else if (a instanceof More) {
          const {k} = a;
          return left(k.map(x => x.flatMap(f)));
        } else {
          const {sub: bf, f: g} = a;
          cur = bf().flatMap(x => g(x).flatMap(f));
        }
      }
    }
  }
  map(f) {
    return this.flatMap(x => new Done(f(x)));
  }
  flatMap(f) {
    if (this instanceof FlatMap) {
      const {sub:a, f:g} = this;
      return new FlatMap(a, x => new FlatMap(() => g(x), f));
    } else {
      const a = this;
      return new FlatMap(() => a, f);
    }
  }
  zip(b) {
    const r1 = this.resume();
    const r2 = b.resume();
    if (r1.isRight() && r2.isRight()) {
      return new Done([r1.value, r2.value]);
    } else if (r1.isLeft() && r2.isLeft()) {
      return new More(r1.value.map(x => r2.value.map(y => x.zip(y))));
    } else if (r1.isLeft() && r2.isRight()) {
      return new More(r1.value.map(x => x.zip(new Done(r2.value))));
    } else {
      return new More(r2.value.map(y => new Done(r1.value).zip(y)));
    }
  }
}

let id = 0;
class FlatMap extends Free {
  constructor(sub, f) {
    super();
    this.sub = sub;
    this.f = f;
    this.id = id++;
  }
}

class More extends Free {
  constructor(k) {
    super();
    this.k = k;
  }
}

class Done extends Free {
  constructor(v) {
    super();
    this.v = v;
  }
}

module.exports = {
  More,
  Done,
};
