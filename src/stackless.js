class State {
  constructor(runS) {
    this.runS = runS;
  }
  map(f) {
    return new State(s => {
      const [a, s1] = this.runS(s);
      return [f(a), s1];
    });
  }
  flatMap(f) {
    return new State(s => {
      const [a, s1] = this.runS(s);
      return f(a).runS(s1);
    });
  }
}

function getState() {
  return new State(s => [s, s]);
}

function setState(s) {
  return new State(() => [{}, s]);
}

function pureState(a) {
  return new State(s => [a, s]);
}

function zipIndex(as) {
  return as.reduce((acc, a) => {
    return acc.flatMap(xs => getState().flatMap(n => setState(n + 1).map(() => xs.concat({
      value: n,
      index: n
    }))))
  }, pureState([])).runS(0)[0]
}

function range(start, endExclusive) {
  const result = [];
  for (let i = start; i < endExclusive; i++) {
    result.push(i);
  }
  return result;
}

console.log(zipIndex(range(0, 5000)))