const express = require("express");
const app = express();


app.get("/", (req,res)=>{
    res.send("Welcome to Chess Wizard");
});

app.listen(3000, ()=>{
    console.log("server is connected to port 3000");
})