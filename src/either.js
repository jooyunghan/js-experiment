const Either = {
  isEither() {
    return true;
  },
  isRight() {
    return false;
  },
  isLeft() {
    return false;
  },
};

const Right = Object.create(Either, {
  isRight: { value: () => true },
});

const Left = Object.create(Either, {
  isLeft: { value: () => true },
});

function right(v) {
  return Object.create(Right, {
    value: { value: v },
  });
}

function left(v) {
  return Object.create(Left, {
    value: { value: v },
  });
}

module.exports = {
  right,
  left,
};
