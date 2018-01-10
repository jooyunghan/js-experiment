class Trampoline {
  runT() {
    let cur = this;
    while (true) {
      const { type, value } = cur.resume();
      if (type === "right") return value;
      cur = value();
    }
  }
  resume() {
    let cur = this;
    while (true) {
      if (cur instanceof Done) {
        return {
          type: "right",
          value: cur.v,
        };
      } else if (cur instanceof More) {
        return {
          type: "left",
          value: cur.k,
        };
      } else {
        if (cur.sub instanceof Done) {
          cur = cur.f(cur.sub.v);
        } else if (cur.sub instanceof More) {
          return {
            type: "left",
            value: () => cur.sub.k().flatMap(cur.f),
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
  zip(b) {
    const r1 = this.resume();
    const r2 = b.resume();
    if (r1.type === "right" && r2.type === "right") {
      return new Done([r1.value, r2.value]);
    } else if (r1.type === "left" && r2.type === "left") {
      return new More(() => r1.value().zip(r2.value()));
    } else if (r1.type === "left" && r2.type === "right") {
      return new More(() => r1.value().zip(new Done(r2.value)));
    } else {
      return new More(() => new Done(r1.value).zip(r2.value()));
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
