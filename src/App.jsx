import styles from './App.module.css';

import { A } from "@solidjs/router";

function App() {
  return (
    <div id="container">
        <div id="content">
            <h1>Ben Douthwaite</h1>
            <p>Software Engineer based in London, UK.</p>
            <ul class="directory-list">
                <li><A href="/playground">Playground</A></li>
                <li>Contact</li>
            </ul>
        </div>
    </div>
  );
}

export default App;
