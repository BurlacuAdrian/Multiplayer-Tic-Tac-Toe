import express from 'express';
import cors from 'cors';
import env from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';

function c(text) {
  console.log(text)
}

env.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());


const roomObjects = new Map();

const roomIdsMap = new Map();
const usedRoomNumbers = new Set();

function checkForWinner(gameState) {
  const winPatterns = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6]             // Diagonals
  ];

  for (const pattern of winPatterns) {
    const [a, b, c] = pattern;
    if (gameState[a] && gameState[a] === gameState[b] && gameState[a] === gameState[c]) {
      return gameState[a]; // Return the winning character (X or O)
    }
  }

  // No winner yet
  return null;
}

io.on('connection', (socket) => {

  function resetGame(userSocket) {
    const roomId = roomIdsMap.get(userSocket.id)
    const roomObj = roomObjects.get(roomId)
    if (!roomObj) {
      c("error")
      return
    }
    roomObj.gameState = Array(9).fill("")
    io.to(roomId).emit("force-reset");
  }

  socket.on('try-move', index => {
    const roomId = roomIdsMap.get(socket.id)
    const roomObj = roomObjects.get(roomId)
    if (!roomObj) {
      c("error")
      return
    }
    if (roomObj.started == false)
      return
    const gameState = roomObj.gameState
    // c(gameState)
    if (gameState[index] == "" && roomObj.turn==socket.id) {
      const character = roomObj.players[0] == socket.id ? "X" : "0"
      gameState[index] = character
      io.to(roomId).emit("force-move", [index, character])

      roomObj.turn = roomObj.players[0]==socket.id? roomObj.players[1] : roomObj.players[0]

      const winner = checkForWinner(gameState);

      if (winner) {
        io.to(roomId).emit("game-over", winner);
        setTimeout(() => {
          io.to(roomId).emit("force-reset");
          resetGame(socket)
        }, 500)
      } else if (gameState.every(function (element) {
        return element !== "";
      })) {
        resetGame(socket)
      }
    }
  })

  socket.on('reset-game', () => {
    resetGame(socket)
  })

  socket.on('join-room', room => {
    if (!roomObjects.has(room)) {
      roomObjects.set(room, {
        players:[socket.id],
        gameState: Array(9).fill(""),
        started: false,
        turn : socket.id
      })
      roomIdsMap.set(socket.id, room)
      socket.join(room)

      // c(roomIdsMap)
      c("Host joined")
      
    } else {
      let roomObj = roomObjects.get(room)
      if (roomObj.players.length == 1) {
        roomObj.players.push(socket.id)
        roomIdsMap.set(socket.id, room)
        socket.join(room)
        // c(roomIdsMap)
        c("Guest joined")
        io.to(roomObj.players[0]).emit("room-info","Friend joined")
        io.to(roomObj.players[0]).emit("start-game", "X");
        io.to(roomObj.players[1]).emit("start-game", "0");
        roomObj.started = true
      } else {
          c("Room full")
        }
    }
  })

  socket.on('disconnect', () => {
    let roomId = roomIdsMap.get(socket.id)

    if (!roomId)
      return

    roomIdsMap.delete(socket.id)
    let roomObj = roomObjects.get(roomId)

    if (!roomObj)
      return

    roomObj.players=roomObj.players.filter(item => item !== socket.id)
    io.to(roomObj.players[0]).emit('friend-disconnected')

    if(roomObj.players.length==0){
      roomObjects.delete(roomId)
      usedRoomNumbers.delete(roomId)
    }

  })


  socket.on('create-room', () => {
    io.to(roomNumber.toString()).emit('room-created', roomNumber);
  })
  socket.on('info', () => {
    console.log(socket.id)
    console.log(socket.rooms)
  })
});

const generateRoomNumber = () => {
  return Math.floor(1000 + Math.random() * 9000);
};

app.get('/hello',(req,res)=>res.status(200).send("hello!"))

app.get('/create-room', async (req, res) => {

  try {

    let roomNumber;
    do {
      roomNumber = generateRoomNumber();
    } while (usedRoomNumbers.has(roomNumber));

    usedRoomNumbers.add(roomNumber)

    console.log({ message: 'Room create successfully', room: roomNumber })
    res.status(200).json({ message: 'Room create successfully', room: roomNumber });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const port = process.env.PORT || 60081;

server.listen(port, () => {
  console.log(`API is running at http://localhost:${port}`);
});
