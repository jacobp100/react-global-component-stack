const React = require("react");
const ReactTestRenderer = require("react-test-renderer");
const globalComenentStack = require(".");

jest.useFakeTimers();

it("should create a global stack and calls updater", async () => {
  const updater = jest.fn();
  const Component = globalComenentStack({ a: 1 }, updater);
  ReactTestRenderer.create(<Component />);
  jest.runAllImmediates();
  expect(updater).toBeCalledWith({ a: 1 }, { a: 1 });
});

it("should calls updater with previous and next props", async () => {
  const updater = jest.fn();
  const Component = globalComenentStack({ a: 1 }, updater);
  const instance = ReactTestRenderer.create(<Component a={2} />);
  jest.runAllImmediates();
  expect(updater).toBeCalledWith({ a: 2 }, { a: 1 });

  instance.update(<Component a={3} />);
  jest.runAllImmediates();
  expect(updater).toBeCalledWith({ a: 3 }, { a: 2 });
});

it("should update with default state when all components unmounted", async () => {
  const updater = jest.fn();
  const Component = globalComenentStack({ a: 1 }, updater);
  const instance = ReactTestRenderer.create(<Component a={2} />);
  jest.runAllImmediates();
  expect(updater).toBeCalledWith({ a: 2 }, { a: 1 });

  instance.update(null);
  jest.runAllImmediates();
  expect(updater).toBeCalledWith({ a: 1 }, { a: 2 });
});

it("should merge props with multiple components", async () => {
  const updater = jest.fn();
  const Component = globalComenentStack({ a: 1, b: 1 }, updater);
  ReactTestRenderer.create(
    <React.Fragment>
      <Component a={2} />
      <Component b={2} />
    </React.Fragment>
  );
  jest.runAllImmediates();
  expect(updater).toBeCalledWith({ a: 2, b: 2 }, { a: 1, b: 1 });
});

it("should generate the state from the mounted components", async () => {
  const updater = jest.fn();
  const Component = globalComenentStack({ a: 1 }, updater);
  const instance = ReactTestRenderer.create(
    <React.Fragment>
      <Component a={2} />
      {null}
    </React.Fragment>
  );
  jest.runAllImmediates();
  expect(updater).toBeCalledWith({ a: 2 }, { a: 1 });

  instance.update(
    <React.Fragment>
      <Component a={2} />
      <Component a={3} />
    </React.Fragment>
  );
  jest.runAllImmediates();
  expect(updater).toBeCalledWith({ a: 3 }, { a: 2 });

  instance.update(
    <React.Fragment>
      <Component a={2} />
      {null}
    </React.Fragment>
  );
  jest.runAllImmediates();
  expect(updater).toBeCalledWith({ a: 2 }, { a: 3 });
});

it("should work with nested components", async () => {
  const updater = jest.fn();
  const Component = globalComenentStack({ a: 1 }, updater);
  ReactTestRenderer.create(
    <React.Fragment>
      <Component a={2} />
      <div>
        <Component a={3} />
      </div>
    </React.Fragment>
  );
  jest.runAllImmediates();
  expect(updater).toBeCalledWith({ a: 3 }, { a: 1 });
});

it("should not call updater if the component is not mounted", async () => {
  const updater = jest.fn();
  globalComenentStack({ a: 1 }, updater);
  ReactTestRenderer.create(<div />);
  jest.runAllImmediates();
  expect(updater).not.toBeCalled();
});
