const express = require("express");
const app = express();
const path = require("path");
const socket = require("socket.io");
const http = require("http");
const { Chess } = require("chess.js");

//socket will need the express based http server 
const server = http.createServer(app);
const io = socket(server);

const chess = new Chess();

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

let players = {};
let currentPlayer = 'w';
let title = "Chess Now"

app.get("/", (req, res) => {
    res.render("index.ejs", { title });
});

io.on("connection", function (uniquesocket) {
    console.log("Connected");

    if (!players.white) {
        players.white = uniquesocket.id;
        uniquesocket.emit("playerRole", 'w');
    } else if (!players.black) {
        players.black = uniquesocket.id;
        uniquesocket.emit("playerRole", 'b');
    } else {
        uniquesocket.emit("spectatorRole");
    }

    uniquesocket.on("disconnect", () => {
        if (uniquesocket.id === players.white) {
            delete players.white;
        }
        else if (uniquesocket.id === players.black) {
            delete players.black;
        }
    })

    //when a players moves hi
    uniquesocket.on("move", (move) => {
        try {
            if (chess.turn() === 'w' && uniquesocket.id != players.white) return;
            if (chess.turn() === 'b' && uniquesocket.id != players.black) return;

            const result = chess.move(move);
            if (result) {
                currentPlayer = chess.turn();
                io.emit("move", move);
                io.emit("boardState", chess.fen())
            } else {
                console.log("invalid move: ", move);
                uniquesocket.emit("Invalid Move", move);
            }
        }
        catch (err) {
            console.log(err);
            uniquesocket.emit("Invalid Move", move);
        }
    })

    // uniquesocket.on("churan" , ()=>{
    //     io.emit("churan paapdi");        //sends data to the client side
    // })

    // uniquesocket.on("disconnect", ()=>{  //when connected disconnects
    //     console.log("disconnected");
    // })
})

server.listen(3000, function () {
    console.log("server is listening on port 3000");
});