const { More, Done } = require("./trampoline");

function fib(n) {
  if (n <= 1) return new Done(n);
  return new More(() => fib(n - 1)).flatMap(x =>
    new More(() => fib(n - 2)).map(y => x + y)
  );
}

console.log(fib(10).runT());

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

// // console.log(recursiveEven(100000));
console.log(trampolineEven(100000).runT());

const print = s => process.stdout.write(s);
const println = s => console.log(s);

const hello = new More(() => new Done(print("Hello, "))).map(() =>
  println("world!")
);

hello.zip(hello).runT();
