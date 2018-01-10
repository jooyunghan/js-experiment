class Trampoline {
  runT() {
    let cur = this;
    while (true) {
      const { right, left } = cur.resume();
      if (right) return right;
      cur = left();
    }
  }
  resume() {
    let cur = this;
    while (true) {
      if (cur instanceof Done) {
        return {
          right: cur.v,
        };
      } else if (cur instanceof More) {
        return {
          left: cur.k,
        };
      } else {
        if (cur.sub instanceof Done) {
          cur = cur.f(cur.sub.v);
        } else if (cur.sub instanceof More) {
          return {
            left: () => cur.sub.k().flatMap(cur.f),
          };
        } else {
          cur = cur.sub.sub.flatMap(x => cur.sub.f(x).flatMap(cur.f));
        }
      }
    }
  }
  map(f) {
    return this.flatMap(x => new Done(f(x)));
  }
  flatMap(f) {
    if (this instanceof FlatMap) {
      return new FlatMap(this.sub, x => this.f(x).flatMap(f));
    } else {
      return new FlatMap(this, f);
    }
  }
}

class FlatMap extends Trampoline {
  constructor(sub, f) {
    super();
    this.sub = sub;
    this.f = f;
  }
}

class More extends Trampoline {
  constructor(k) {
    super();
    this.k = k;
  }
}

class Done extends Trampoline {
  constructor(v) {
    super();
    this.v = v;
  }
}

module.exports = {
  More,
  Done,
};
