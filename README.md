# React Global Component Stack

Sometimes you have a single component on a page, but you want to be able to modify it from other components. You could hoist your state, and pass down some updater functions with context. However, this takes a different approach, based of React Native's `StatusBar` component.

React Native has a `<StatusBar />` component. This component doesn't actually render anything, but what it does do is update the props of the status bar. To turn hide existing status bar, you just render `<StatusBar hidden />`.

You can render as many of these as you want, and the last rendered status bar "wins". Their props are actually merged, you don't have to keep track of all the other components.

Let's say we want to set the title of a web page. A naïve implementation could look like this,

```js
class Title extends Component {
  componentDidMount() {
    document.title = this.props.title;
  }

  componentDidUnmount() {
    // What do we do here?
  }

  render() {
    return null;
  }
}
```

We can implement the same with this library.

```js
import globalComponentStack from "react-global-component-stack";

const Title = globalComponentStack({ title: "" }, props => {
  document.title = props.title;
});
```

The first argument is the default props, and the second is a function that is run whenever the props change. The function is actually called with `(currentProps, previousProps)`, so you can be more efficient about updates.

When there are no `Title` components mounted, the updater will get called with the default props, and the page title will be cleared. If you render two `Title` components, and one of them unmounts, the document's title will be what is defined in the remaining component.

Say we want to implement a way to hide the home indicator on the new iPhone X. We can implement some native code that can toggle it, and expose a component as so.

```
npm install react-global-component-stack
```

```js
const HomeIndicator = globalComponentStack(
  { hidden: false },
  (props, prevProps) => {
    if (props.hidden !== prevProps.hidden) {
      NativeCode.HomeIndicatorManager.setHidden(props.hidden);
    }
  }
);
```

If we have an actual React component that we want to render based on the merged props, that's possible too.

```js
let delegate;
const defaultState = { inverted: false };

const NavBar = globalComponentStack(defaultState, props => {
  if (delegate != null) {
    delegate.setState({ inverted: props.inverted });
  }
});

class NavBarComponent extends Component {
  constructor() {
    super();
    delegate = this;
    this.state = defaultState;
  }

  render() {
    const { inverted } = this.state;
    return <your-markup />;
  }
}
```

This obviously can't be used everywhere, but it can be really handy in places.
