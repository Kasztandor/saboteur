let main = document.querySelector("main")
let clientId = null
let gameId = null
let ws = null

function menu(){
    main.innerHTML = `
        <div id="menu">
            <div>SABOTEUR</div>
            <div>
                <div onclick="createGamePopup()">Create game</div>
                <div onclick="joinGamePopup()">Join game</div>
            </div>
        </div>
        <div id="darkScreen" style="display:none;"></div>
        <div id="popup"></div>
    `
}
function createGamePopup(){
    document.querySelector("#darkScreen").style.display = "block"
    document.querySelector("#popup").innerHTML = `
        <h1>Create game</h1>
        <table>
        <tr>
            <td>Nickname:</td>
            <td><input type="text" id="nickname"></td>
        </tr>
        <tr>
            <td>Max players:</td>
            <td>
                <select id="players">
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                    <option value="6">6</option>
                    <option value="7">7</option>
                    <option value="8">8</option>
                    <option value="9">9</option>
                    <option value="10">10</option>
                </select><br>
            </td>
        </tr>
        </table>
        <button onclick="createGame()">Create game</button>
        <button onclick='closePopup()'>Cancel</button>
    `
}
function joinGamePopup(){
    document.querySelector("#darkScreen").style.display = "block"
    document.querySelector("#popup").innerHTML = `
        <h1>Enter code</h1>
        <table>
        <tr>
            <td>Nickname:</td>
            <td><input type="text" id="nickname"></td>
        </tr>
        <tr>
            <td>Code:</td>
            <td><input type="text" id="code"></td>
        </tr>
        </table>
        <button onclick="joinGame()">Dołącz</button>
        <button onclick='closePopup()'>Cancel</button>
    `
}
function closePopup(){
    document.querySelector("#popup").innerHTML = ""
    document.querySelector("#darkScreen").style.display = "none"
}
function createGame(){
    ws = new WebSocket("ws://localhost:8081")
    ws.onmessage = (msg)=>{
        let data = JSON.parse(msg.data)
        /*switch(data.type){
            case "gameCreated":
                clientId = data.playerId
                gameId = data.gameId
                break
        }*/
        console.log(data)
    }
    ws.onopen = ()=>{
        ws.send(JSON.stringify({type: "createGame", nickname: document.querySelector("#nickname").value , maxPlayers: document.querySelector("#players").value}))
    }
}
function joinGame(){
    ws = new WebSocket("ws://localhost:8081")
    ws.onmessage = (msg)=>{
        let data = JSON.parse(msg.data)
        console.log(data)
        switch(data.type){
            case "gameJoined":
                break
            case "gameNotFound":
                // do something
                ws.close()
                break
        }
    }
    ws.onopen = ()=>{
        ws.send(JSON.stringify({type: "joinGame", nickname: document.querySelector("#nickname").value, code: document.querySelector("#code").value}))
    }
}
window.onload=()=>{
    menu()
}