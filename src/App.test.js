import { render, screen } from '@testing-library/react';
import App from './App';

jest.mock('react-router-dom', () => {
  const React = require('react');

  return {
    BrowserRouter: ({ children }) => React.createElement(React.Fragment, null, children),
    Routes: ({ children }) => React.createElement(
      React.Fragment,
      null,
      Array.isArray(children) ? children[0] : children
    ),
    Route: ({ element }) => element,
  };
}, { virtual: true });

jest.mock('./components/layout/Sidebar', () => () => <div>Sidebar</div>);
jest.mock('./components/layout/Header', () => () => <div>Header</div>);
jest.mock('./components/layout/StatusBar', () => () => <div>StatusBar</div>);
jest.mock('./components/common/Toast', () => () => <div>Toast</div>);
jest.mock('./components/common/LoadingBar', () => () => <div>LoadingBar</div>);
jest.mock('./pages/Dashboard', () => () => <div>Dashboard Page</div>);
jest.mock('./pages/Live', () => () => <div>Live Page</div>);
jest.mock('./pages/Schedule', () => () => <div>Schedule Page</div>);
jest.mock('./pages/Weekend', () => () => <div>Weekend Page</div>);
jest.mock('./pages/Results', () => () => <div>Results Page</div>);
jest.mock('./pages/Grid', () => () => <div>Grid Page</div>);
jest.mock('./pages/Standings', () => () => <div>Standings Page</div>);
jest.mock('./pages/Driver', () => () => <div>Driver Page</div>);
jest.mock('./pages/Settings', () => () => <div>Settings Page</div>);

test('renders the dashboard route by default', () => {
  render(<App />);
  expect(screen.getByText(/dashboard page/i)).toBeInTheDocument();
});
