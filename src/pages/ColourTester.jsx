import './ColourTester.css';

import { createSignal } from "solid-js";

export default function ColourTester() {

    const [primaryTextColour, setPrimaryTextColour] = createSignal("#ffffff");
    const [primaryBackgroundColour, setPrimaryBackgroundColour] = createSignal("#000000");
    const [secondaryTextColour, setSecondaryTextColour] = createSignal("#dddddd");
    const [secondaryBackgroundColour, setSecondaryBackgroundColour] = createSignal("#333333");

    function getRandomColour() {
        var randomColour = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
        return randomColour;
    }

    return (
        <div id="colour-tester">
            <div id="content">
                <h1>Colour Tester</h1>
                <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                </p>
                <div class="secondary">
                    <p>
                        Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                    </p>
                </div>
                <div id="controls">
                    <ul>
                        <li>Primary Text: <span class="primary-text">{primaryTextColour}</span></li>
                        <li>Secondary Text: <span class="secondary-text">{secondaryTextColour}</span></li>
                        <li>Primary Background: <span class="primary-background">{primaryBackgroundColour}</span></li>
                        <li>Secondary Background <span class="secondary-background">{secondaryBackgroundColour}</span></li>
                    </ul>
                    <button id="randomise" onClick={() => {
                        var colourTester = document.getElementById("colour-tester");

                        setPrimaryTextColour(getRandomColour());
                        colourTester.style.setProperty("--primary-text-color", primaryTextColour());

                        setPrimaryBackgroundColour(getRandomColour());
                        colourTester.style.setProperty("--primary-background-color", primaryBackgroundColour());

                        setSecondaryTextColour(getRandomColour());
                        colourTester.style.setProperty("--secondary-text-color", secondaryTextColour());

                        setSecondaryBackgroundColour(getRandomColour());
                        colourTester.style.setProperty("--secondary-background-color", secondaryBackgroundColour());

                    }}>Randomise</button>
                </div>

            </div>
        </div>
    )
}