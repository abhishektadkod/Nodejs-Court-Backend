const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const http = require("http");
const socketIo = require("socket.io");
const axios = require("axios");

var lawyerRouter = require('./routes/lawyer');
var clientRouter = require('./routes/client');
var url = process.env.MONGO_COURT;

const PORT = process.env.PORT || 4000;
const court="Court"


app.use(cors({origin:['http://localhost:3000','http://192.168.1.8:3000','https://pacific-bastion-93687.herokuapp.com'],credentials: true,}))


app.use(bodyParser.json());

mongoose.connect('mongodb+srv://abhishek:abhishek_1@cluster0-h2txx.mongodb.net/test?retryWrites=true&w=majority',  {
    useCreateIndex: true,
    useNewUrlParser: true
  });
const connection = mongoose.connection;

connection.once('open', function() {
    console.log("MongoDB database '"+court+"' connection established successfully");
})

app.use('/client', clientRouter);
app.use('/lawyer', lawyerRouter);
app.use('/logged/:id', function(req,res){res.json("SIGN UP!"+req.params.id)})

const server = http.createServer(app);

const io = socketIo(server); // < Interesting!

let interval1;
let interval2;

const lawyersoc=(id)=>{
  io.of("/lawyer/"+id).on("connection", socket => {
  console.log("New client connected-"+socket.id);
  if (interval1) {
    clearInterval(interval1);
  }
  interval1 = setInterval(() => getApiAndEmit(socket,socket["lawyer"]), 1000);

  socket.on("disconnect", () => {
    console.log("Client disconnected-"+socket.id);
  });
  socket.on("lawyerid", data => {socket["lawyer"]=data});
});
}

//lawyersoc("5ea31d7f8c8be91da61fc148");

//clientsoc("5e773f13739d78e824120b1e")

const clientsoc=(id)=>{

  io.of("/client/"+id).on("connection", socket => {
  console.log("New client connected-"+socket.id);
  
  if (interval2) {
    clearInterval(interval2);
  }

  interval2 = setInterval(() => getClientApiAndEmit(socket,socket["clients"]), 1000);

  socket.on("disconnect", () => {
    console.log("Client disconnected-"+socket.id);
  });
  socket.on("clientid", data => {socket["clients"]=data});
});
}

const getApiAndEmit = async (socket,lawyer) => {
    try {
      const cases = await axios.get(
        "https://safe-taiga-19842.herokuapp.com/lawyer/select/"+lawyer
      ); 
      socket.emit("F",cases.data); // Emitting a new message. It will be consumed by the client
    } catch (error) {
      console.error(`Error: ${error.code}`);
    }  
  };


  const getClientApiAndEmit = async (socket,client) => {

    try {
      const cases = await axios.get(
        "https://safe-taiga-19842.herokuapp.com/client/select/"+client
      ); 
      socket.emit("F",cases.data); // Emitting a new message. It will be consumed by the client
    } catch (error) {
      console.error(`Error: ${error.code}`);
    }  
  };


server.listen(PORT, () => console.log(`Listening on port ${PORT}`));


exports.clientsoc = clientsoc;
exports.lawyersoc = lawyersoc;