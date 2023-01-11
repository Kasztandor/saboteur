let express = require('express')
let app = express()

app.use(express.static(__dirname+'/site')) 

app.get("/",(req,res)=>{
    res.sendFile(__dirname+"/site/index.html")  
})

app.get("/test",(req,res)=>{
    res.send({a:1,b:2,c:3})
})

app.listen(8080,()=>{console.log('App listening on port 8080!')})