const debug = require("util").debuglog("parser");

function Parens() {
  const FAIL = {
    toString() {
      return "FAILURE";
    },
  };

  let _input;
  let _pos;

  function parse(input) {
    debug(`parse("${input}")`);
    _input = input;
    _pos = 0;

    let stack = [start()];
    let result;
    while (stack.length) {
      let parser = stack[stack.length - 1];
      const { value, done } = parser.next(result);
      if (done) {
        stack.pop();
        result = value;
      } else if (value.next) {
        stack.push(value);
        result = undefined;
      } else {
        throw new Error(`can't handle yield ${value}`);
      }
    }

    if (result === FAIL || _pos < _input.length) {
      throw new Error("parse error");
    }
    return result;
  }

  // start = parens
  function* start() {
    let s;
    s = yield parens();
    return s;
  }
  start.prototype.name = "start";

  // parens = paren*
  function* parens() {
    let result = [];
    while (true) {
      let s = yield paren();
      if (s === FAIL) break;
      result.push(s);
    }
    return result;
  }
  parens.prototype.name = "parens";

  // paren = p1 | p2 | p3
  function* paren() {
    let s;
    s = yield p1();
    if (s !== FAIL) {
      return s;
    }
    s = yield p2();
    if (s !== FAIL) {
      return s;
    }
    s = yield p3();
    return s;
  }
  paren.prototype.name = "paren";

  // p1 = '(' parens ')'
  function* p1() {
    let s;
    s = yield seq(char("("), parens(), char(")"));
    return s;
  }
  p1.prototype.name = "p1";

  // p2 = '[' parens ']'
  function* p2() {
    let s;
    s = yield seq(char("["), parens(), char("]"));
    return s;
  }
  p2.prototype.name = "p2";

  function* seq(...ps) {
    let result = [];
    let p = _pos;
    while (ps.length) {
      const parser = ps.shift();
      let s = yield parser;
      if (s === FAIL) {
        _pos = p;
        return s;
      }
      result.push(s);
    }
    return result;
  }
  seq.prototype.name = "seq";

  // p3 = '{' parens '}'
  function* p3() {
    let s;
    s = yield seq(char("{"), parens(), char("}"));
    return s;
  }
  p3.prototype.name = "p3";

  // char c
  function* char(c) {
    if (_pos < _input.length && _input[_pos] === c) {
      _pos++;
      return c;
    }
    return FAIL;
  }
  char.prototype.name = "char";

  return {
    parse,
  };
}

const P = Parens();

function isValid(s) {
  try {
    P.parse(s);
    return true;
  } catch (e) {
    return false;
  }
}

console.log(isValid("()[]{}()"));
console.log(isValid("[()]"));
console.log(isValid("[(][)]"));
console.log(isValid(require("../parser-input.json")));
