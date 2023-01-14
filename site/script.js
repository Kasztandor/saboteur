let main = document.querySelector("main")
let clientId = null
let gameId = null
let nickname = null
let ws = null
let clients = {}

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
        <button onclick='startGame("create")'>Create game</button>
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
        <button onclick='startGame("join")'>Dołącz</button>
        <button onclick='closePopup()'>Cancel</button>
    `
}
function closePopup(){
    document.querySelector("#popup").innerHTML = ""
    document.querySelector("#darkScreen").style.display = "none"
}
function startGame(x){
    nickname = document.querySelector("#nickname").value
    ws = new WebSocket("ws://185.150.132.76:8081")
    ws.onmessage = (msg)=>{
        let data = JSON.parse(msg.data)
        switch(data.type){
            case "gameCreated":
                clientId = data.playerId
                gameId = data.gameId
                document.querySelector("#players").innerHTML += `<li>${nickname}</li>`
                clients[data.playerId] = {nickname: nickname, role: "host"}
                document.querySelector("#gameCode").innerHTML = gameId
                break
            case "gameJoined":
                clientId = data.playerId
                gameId = data.gameId
                clients = JSON.parse(JSON.stringify(data.players))
                clients[data.playerId] = {nickname: nickname, role: "player"}
                Object.keys(clients).forEach((key)=>{
                    document.querySelector("#players").innerHTML += `<li>${clients[key].nickname}</li>`
                })
                document.querySelector("#gameCode").innerHTML = gameId
                break
            case "gameNotFound":
                // do something
                ws.close()
                break
            case "newPlayer":
                document.querySelector("#players").innerHTML += `<li>${data.nickname}</li>`
                clients[data.playerId] = {nickname: data.nickname, role: data.role}
                break
            case "playerLeft":
                document.querySelector("#players").innerHTML = ""
                delete clients[data.playerId]
                Object.keys(clients).forEach((key)=>{
                    document.querySelector("#players").innerHTML += `<li>${clients[key].nickname}</li>`
                })
                break
        }
        console.log(data)
    }
    ws.onopen = ()=>{
        if (x == "create")
            ws.send(JSON.stringify({type: "createGame", nickname: document.querySelector("#nickname").value , maxPlayers: document.querySelector("#players").value}))
        else if (x == "join")
        ws.send(JSON.stringify({type: "joinGame", nickname: document.querySelector("#nickname").value, code: document.querySelector("#code").value}))
        main.innerHTML = `
            <div id="waitingRoom">
                <h1>Waiting room</h1>
                <div>Game code: <span id="gameCode"></span></div>
                <ul id="players"></ul>
            </div>
        `
    }
    ws.onclose = ()=>{
        menu()
    }
}
window.onload=()=>{
    menu()
}