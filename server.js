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
    let nickname, clientId, gameId
    ws.on("close",()=>{
        if (clients.hasOwnProperty(clientId))
            delete clients.clientId
        if (games.hasOwnProperty(gameId)){
            games[gameId].players.splice(games[gameId].players.indexOf(clientId),1)
            if (games[gameId].players.length == 0)
                delete games[gameId]
            else{
                games[gameId].players.forEach(element => {
                    clients[element].ws.send(JSON.stringify({type: "playerLeft", playerId: clientId, role: games[gameId].host == clientId ? "host" : "player"}))
                })
            }
            console.log(games)
        }
        console.log("Client "+clientId+" disconnected")
    })
    ws.on("message",(msg)=>{
        let data = JSON.parse(msg)
        switch(data.type){
            case "createGame":
                nickname = data.nickname
                clientId = generateId("client")
                clients[clientId] = {ws: ws, nickname: nickname}
                gameId = generateId("game")
                games[gameId] = {players: [clientId], maxPlayers: data.maxPlayers, host: clientId, status: "waitingRoom"}
                ws.send(JSON.stringify({type: "gameCreated", gameId: gameId, playerId: clientId}))
                break
            case "joinGame":
                if (games.hasOwnProperty(data.code)){
                    nickname = data.nickname
                    gameId = data.code
                    clientId = generateId("client")
                    clients[clientId] = {ws: ws, nickname: nickname}
                    let players = {}
                    games[data.code].players.forEach(element => {
                        players[element] = {nickname: clients[element].nickname, playerId: clients[element].playerId, role: (games[gameId].host == element ? "host" : "player")}
                        clients[element].ws.send(JSON.stringify({type: "newPlayer", playerId: clientId, nickname: nickname, role: (games[gameId].host == clientId ? "host" : "player")}))
                    })
                    ws.send(JSON.stringify({type: "gameJoined", playerId: clientId, players: players, role: "player"}))
                    games[data.code].players.push(clientId)
                }
                else{
                    ws.send(JSON.stringify({type: "gameNotFound"}))
                    ws.close()
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