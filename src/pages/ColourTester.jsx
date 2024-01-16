import './ColourTester.css';

export default function ColourTester() {
    return (
        <div id="colour-tester">
            <div id="content">
                <h1>Colour Tester</h1>

                <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                </p>
                <button onClick={() => {
                    var randomColor = Math.floor(Math.random()*16777215).toString(16);
                    var colourTester = document.getElementById("colour-tester");
                    colourTester.style.setProperty("--main-text-color", "#" + randomColor);
                }}>Change Colour</button>
            </div>
        </div>
    )
}