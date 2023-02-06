const express = require('express')
const WebSocket = require('ws')
const app = express()
const wss = new WebSocket.Server({ port: 8081 })

let clients = {}
let games = {}

function generateId(x){
    let chars, len, dict, ret
    if (x == "client"){
        chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
        len = 10
        dict = clients
    }
    else if (x == "game"){
        chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
        len = 6
        dict = games
    }
    else{
        return "Error"
    }
    do{
        ret = ""
        for (let j = 0; j < len; j++) {
            ret += chars[Math.floor(Math.random()*chars.length)]
        }
    }
    while(dict.hasOwnProperty(ret))
    return ret
}

wss.on('connection', function connection(ws) {
    let nickname, playerId, gameId
    ws.on("close",()=>{
        if (clients.hasOwnProperty(playerId))
            delete clients.playerId
        if (games.hasOwnProperty(gameId)){
            games[gameId].players.splice(games[gameId].players.indexOf(playerId),1)
            if (games[gameId].players.length == 0)
                delete games[gameId]
            else{
                games[gameId].players.forEach(el => {
                    clients[el].ws.send(JSON.stringify({type: "playerLeft", playerId: playerId}))
                })
                if (games[gameId].host == playerId){
                    games[gameId].host = games[gameId].players[0]
                    games[gameId].players.forEach(el=>{
                        clients[el].ws.send(JSON.stringify({type: "newHost", playerId: games[gameId].host}))
                    })
                }
            }
            console.log(games)
        }
        console.log("Client "+playerId+" disconnected")
    })
    ws.onopen = ()=>{}
    ws.on("message",(msg)=>{
        let data = JSON.parse(msg)
        switch(data.type){
            case "createGame":
                nickname = data.nickname
                playerId = generateId("client")
                clients[playerId] = {ws: ws, nickname: nickname}
                gameId = generateId("game")
                games[gameId] = {players: [playerId], maxPlayers: data.maxPlayers, host: playerId, status: "waitingRoom"}
                ws.send(JSON.stringify({type: "gameCreated", gameId: gameId, playerId: playerId}))
                break
            case "joinGame":
                if (games.hasOwnProperty(data.code)){
                    if (games[data.code].status == "waitingRoom"){
                        nickname = data.nickname
                        gameId = data.code
                        playerId = generateId("client")
                        clients[playerId] = {ws: ws, nickname: nickname}
                        let players = {} // prepared to send by socket
                        games[data.code].players.forEach(element => {
                            players[element] = {nickname: clients[element].nickname, playerId: clients[element].playerId, role: (games[gameId].host == element ? "host" : "player")}
                            clients[element].ws.send(JSON.stringify({type: "newPlayer", playerId: playerId, nickname: nickname, role: (games[gameId].host == playerId ? "host" : "player")}))
                        })
                        ws.send(JSON.stringify({type: "gameJoined", playerId: playerId, players: players, role: "player", gameId: gameId}))
                        games[data.code].players.push(playerId)
                    }
                    else{
                        ws.send(JSON.stringify({type: "closeGame", reason: "Game in progress."}))
                    }
                }
                else{
                    ws.send(JSON.stringify({type: "closeGame", reason: "Game not found."}))
                    ws.close()
                }
                break
            case "startGame":
                if (games[gameId].host == playerId){
                    games[gameId].status = "inGame"
                    games[gameId].players.forEach(element => {
                        clients[element].ws.send(JSON.stringify({type: "startGame"}))
                    })
                }
                break
        }
    })
})

app.use(express.static(__dirname+'/site')) 

app.get("/",(req,res)=>{
    res.sendFile(__dirname+"/site/index.html")
})

app.get("/test",(req,res)=>{
    res.send({a:1,b:2,c:3})
})

app.listen(8080,()=>{console.log('App listening on port 8080!')})