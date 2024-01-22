/* @refresh reload */
import { render } from 'solid-js/web';

import './index.css';
import App from './App';
import Projects from './pages/Projects';
import Playground from './pages/Playground';
import ColourTester from './pages/ColourTester';
import FinanceTracker from './pages/FinanceTracker';
import { HashRouter, Route } from "@solidjs/router";
const root = document.getElementById('root');

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    'Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?',
  );
}

render(
  () => (
    <HashRouter>
      <Route path="/" component={App} />
      <Route path="/playground" component={Playground} />
      <Route path="/projects" component={Projects} />
      <Route path="/projects/finance-tracker" component={FinanceTracker} />
      <Route path="/playground/colour-tester" component={ColourTester} />
    </HashRouter>
  ),
  root
);

