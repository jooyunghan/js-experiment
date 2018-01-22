const FAIL = {};
const CALL = {};

let _input;
let _pos;

function parse(input) {
  _input = input;
  _pos = 0;

  let c = call(start, [], x => x);
  let stack = [];
  while (c.type === CALL) {
    stack.push(c.cb);
    c = c.f(...c.args);
    while (c.type !== CALL && stack.length > 0) {
      c = stack.pop()(c);
    }
  }
  return c;
}

function call(f, args, cb) {
  return {
    type: CALL,
    f,
    args,
    cb,
  };
}

function start() {
  return call(parens, [], s => s);
}

function parens() {
  let result = [];
  return call(paren, [], function handle(s) {
    if (s === FAIL) return Math.max(0, ...result);
    result.push(s);
    return call(paren, [], handle);
  });
}

function paren() {
  return call(p1, [], s => {
    if (s !== FAIL) return s;
    return call(p2, [], s => {
      if (s !== FAIL) return s;
      return call(p3, [], s => s);
    });
  });
}

function p1() {
  let old = _pos;
  return call(char, ["("], s1 => {
    if (s1 !== FAIL)
      return call(parens, [], s2 => {
        if (s2 !== FAIL) {
          return call(char, [")"], s3 => {
            if (s3 !== FAIL) {
              return s2 + 1;
            }
            _pos = old;
            return FAIL;
          });
        }
        _pos = old;
        return FAIL;
      });
    _pos = old;
    return FAIL;
  });
}

function p2() {
  let old = _pos;
  return call(char, ["["], s1 => {
    if (s1 !== FAIL)
      return call(parens, [], s2 => {
        if (s2 !== FAIL) {
          return call(char, ["]"], s3 => {
            if (s3 !== FAIL) {
              return s2 + 1;
            }
            _pos = old;
            return FAIL;
          });
        }
        _pos = old;
        return FAIL;
      });
    _pos = old;
    return FAIL;
  });
}

function p3() {
  let old = _pos;
  return call(char, ["{"], s1 => {
    if (s1 !== FAIL)
      return call(parens, [], s2 => {
        if (s2 !== FAIL) {
          return call(char, ["}"], s3 => {
            if (s3 !== FAIL) {
              return s2 + 1;
            }
            _pos = old;
            return FAIL;
          });
        }
        _pos = old;
        return FAIL;
      });
    _pos = old;
    return FAIL;
  });
}

function char(c) {
  if (_pos < _input.length && _input[_pos] === c) {
    _pos++;
    return c;
  }
  return FAIL;
}

function long(n) {
  let s = "";
  while (n-- > 0) s = "(" + s + ")";
  return s;
}

console.log(parse("()[]{}()"));
console.log(parse("[()]"));
console.log(parse("[(][)]"));
console.log(parse(long(100000)));
