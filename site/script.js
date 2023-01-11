let main = document.querySelector("main")
let serverInterval = null

function menu(){
    main.innerHTML = `
        <div id="menu">
            <div>SABOTEUR</div>
            <div>
                <div onclick="createGamePopup()">Create game</div>
                <div onclick="joinGamePopup()">Join game</div>
            </div>
        </div>
        <div id="popup"></div>
    `
}
function createGamePopup(){
    //
}
function joinGamePopup(){
    document.querySelector("#popup").innerHTML = `
        <h1>Wpisz kod poczekalni</h1>
        <input type="text">
        <button onclick="joinGame()">Dołącz</button>
    `
}
window.onload=()=>{
    menu()
}