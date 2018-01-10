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


