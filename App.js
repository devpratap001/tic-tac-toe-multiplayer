const express= require("express");
const { createServer }= require("http");
const {Server} = require("socket.io");

const app= express();
const server= createServer(app);
const io= new Server(server);
var rawSockets= [];
var sockets= [];
var userPair= [];

app.use(express.static(__dirname + "/public/home"));
app.use("/game", express.static(__dirname + "/public/game"));

app.get("/", (req, res, next) => {
    res.send("");
});

io.on("connection", (socket) => {
    socket.on("playerJoin", (data) => {
        socket.data= data;
        sockets.push(socket);
        rawSockets.push(socket);
        if (sockets.length ==2 ){
            userPair= [...sockets];
            sockets= [];
            userPair.forEach((elem) => {
                elem.emit("matchFound", {playerOne: userPair[0].data, playerTwo: userPair[1].data, turn: "O", activePlayer: userPair[0].data});
            })
        }
    })
    socket.on("clickedData", (data) => {
        var competetor = []; 
        competetor= rawSockets.filter((elem) => {
            if (elem.data.name === data.competor.name) {
                return elem ;
            }
        })
        competetor[0].emit("clickedDataServer", (data));
    })
    socket.on("turnChangeClient", (data) => {
        var socketsPair= [];
        socketsPair= rawSockets.filter((elem) => {
            if (elem.data.name === data.playerOne.name || elem.data.name === data.playerTwo.name){
                return elem ;
            }
        })
        socketsPair.forEach((elem) => {
            elem.emit("turnChangeServer", {
                ...data,
                activePlayer: data.activePlayer.name === data.playerOne.name ? data.playerTwo: data.playerOne ,
                turn: data.turn === "O" ? "X": "O" ,
            })
        })
    })
    socket.on("reloadBoard", (datamatch) => {
        const competetor= rawSockets.filter((elem) => {
            if (elem.data.name === datamatch.opponent.name){
                return elem;
            }
        })
        competetor[0].emit("reloadBoardServer", {...datamatch});
    })
    socket.on("chatMessage", (data) => {
        const competetor= rawSockets.filter((elem) => {
            if (elem.data.name === data.competor.name){
                return elem;
            }
        })
        competetor[0].emit("chatMessageServer", {payload: data.payload});
    })

    socket.on("disconnect", ()=> {
        sockets.splice(sockets.indexOf(socket.data), 1);
        rawSockets.splice(rawSockets.indexOf(socket).data, 1);
    })
})

server.listen(3000, () => {
    console.log("server started at port 3000");
})