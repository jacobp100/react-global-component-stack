const { Component } = require("react");

// See comments in React Native StatusBar.js for info on how this works

function mergePropsStack(propsStack, defaultValues) {
  if (propsStack.length === 0) return defaultValues;

  return propsStack.reduce((prev, cur) => {
    for (const prop in cur) {
      if (cur[prop] != null) {
        prev[prop] = cur[prop];
      }
    }
    return prev;
  }, Object.assign({}, defaultValues));
}

module.exports = (defaultState, updater) => {
  const propsStack = [];
  let currentValues = defaultState;
  let updateImmediate = null;

  const emitUpdate = () => {
    const previousValues = currentValues;
    currentValues = mergePropsStack(propsStack, defaultState);

    if (currentValues !== previousValues) {
      updater(currentValues, previousValues);
    }
  };

  const updatePropsStack = () => {
    clearImmediate(updateImmediate);
    updateImmediate = setImmediate(emitUpdate);
  };

  return class Stack extends Component {
    constructor() {
      super();
      this._stackEntry = null;
    }

    componentDidMount() {
      this._stackEntry = this.props;
      propsStack.push(this._stackEntry);
      updatePropsStack();
    }

    componentWillUnmount() {
      const index = propsStack.indexOf(this._stackEntry);
      propsStack.splice(index, 1);
      updatePropsStack();
    }

    componentDidUpdate() {
      const index = propsStack.indexOf(this._stackEntry);
      this._stackEntry = this.props;
      propsStack[index] = this._stackEntry;
      updatePropsStack();
    }

    render() {
      return null;
    }
  };
};
