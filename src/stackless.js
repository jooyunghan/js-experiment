const { More, Done } = require("./trampoline");

const Unit = Object.create(null);

class State {
  constructor(runS) {
    this.runS = runS;
  }
  map(f) {
    return new State(
      s => new More(() => this.runS(s).map(([a, s1]) => [f(a), s1]))
    );
  }
  flatMap(f) {
    return new State(
      s =>
        new More(() =>
          this.runS(s).flatMap(([a, s1]) => new More(() => f(a).runS(s1)))
        )
    );
  }
}

function getState() {
  return new State(s => new Done([s, s]));
}

function setState(s) {
  return new State(() => new Done([Unit, s]));
}

function pureState(a) {
  return new State(s => new Done([a, s]));
}

function zipIndex(as) {
  return as
    .reduce((acc, a) => {
      return acc.flatMap(xs =>
        getState().flatMap(n =>
          setState(n + 1).map(() =>
            xs.concat({
              value: n,
              index: n,
            })
          )
        )
      );
    }, pureState([]))
    .runS(0)
    .runT()[0];
}

function range(start, endExclusive) {
  const result = [];
  for (let i = start; i < endExclusive; i++) {
    result.push(i);
  }
  return result;
}

console.log(zipIndex(range(0, 10000)));
