class State {
  constructor(runS) {
    this.runS = runS;
  }
  map(f) {
    return new State(s => {
      const [a, s1] = this.runS(s).runT();
      return new Done([f(a), s1]);
    });
  }
  flatMap(f) {
    return new State(s => {
      const [a, s1] = this.runS(s).runT();
      return new More(() => f(a).runS(s1));
    });
  }
}

function getState() {
  return new State(s => new Done([s, s]));
}

function setState(s) {
  return new State(() => new Done([{}, s]));
}

function pureState(a) {
  return new State(s => new Done([a, s]));
}

function zipIndex(as) {
  return as.reduce((acc, a) => {
    return acc.flatMap(xs => getState().flatMap(n => setState(n + 1).map(() => xs.concat({
      value: n,
      index: n
    }))))
  }, pureState([])).runS(0).runT()[0]
}

function range(start, endExclusive) {
  const result = [];
  for (let i = start; i < endExclusive; i++) {
    result.push(i);
  }
  return result;
}

class Trampoline {
  runT() {
    let cur = this;
    while (cur instanceof More) {
      cur = cur.k();
    }
    return cur.v;
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

function recursiveEven(n) {
  function even(n) {
    if (n === 0) return true;
    return odd(n - 1);
  }

  function odd(n) {
    if (n === 0) return false;
    return even(n - 1);
  }

  return even(n);
}

function trampolineEven(n) {
  function even(n) {
    if (n === 0) return new Done(true);
    return new More(() => odd(n - 1));
  }

  function odd(n) {
    if (n === 0) return new Done(false);
    return new More(() => even(n - 1));
  }
  return even(n);
}

// console.log(recursiveEven(100000));
// console.log(trampolineEven(100000).runT());

console.log(zipIndex(range(0, 10000)))