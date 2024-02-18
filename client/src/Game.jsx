import { useState, useEffect, useRef } from 'react'
import './App.css'
import io from 'socket.io-client';
import {Link, useNavigate, useParams } from 'react-router-dom';


function Game() {
  const [squares, setSquares] = useState(Array(9).fill(""))
  const navigate = useNavigate()
  const roomParams = useParams()
  const roomNumber = roomParams.room
  const [score, setScore] = useState([0, 0])
  const [gameStarted, setGameStarted] = useState(false)
  const ch = useRef(null)
  const [myTurn,setMyTurn]=useState(null)

  const socketRef = useRef(null);

  function squareClick(index) {
    socketRef.current.emit('try-move', index)
  }

  useEffect(() => {

    socketRef.current = io('http://localhost:8001', {
      query: {
        room: roomNumber
      }
    });

    socketRef.current.on('connect', () => {
      console.log('Connected to server');
    });

    socketRef.current.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    socketRef.current.on('room-created', roomNumber => {
      console.log("Joining " + roomNumber)
      // navigate(`/${roomNumber}`)
    })

    socketRef.current.on("force-move", ([index, value]) => {
      setSquares(oldSquares => {
        const newSquares = [...oldSquares];
        newSquares[index] = value;
        return newSquares;
      })
      setMyTurn(oldVal=>!oldVal)

    })

    socketRef.current.on('game-over', winner => {
      setScore(oldScore => {
        let newScore = [...oldScore]
        if (winner == ch.current)
          newScore[0]++
        else
          newScore[1]++
        return newScore
      })

    })

    socketRef.current.on('force-reset', () => {
      setSquares(Array(9).fill(""))
    })

    socketRef.current.on('start-game', (x) => {
      setGameStarted(true)
      ch.current = x
      if(x=='X')
        setMyTurn(true)
      else
        setMyTurn(false)
    })

    socketRef.current.on('friend-disconnected',() => {
      // console.log('friend-disconnected')
        setSquares(Array(9).fill(""))
        setGameStarted(false)
        setScore([0,0])
    })

    join()

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  





  function join() {
    socketRef.current.emit('join-room', roomNumber)
  }

  function reset() {
    socketRef.current.emit('reset-game')
  }



  return (
    <>
      <div className='flex w-1/2 justify-around'>
        {gameStarted ? (
          <div className='absolute m-0 b-0 top-0 bg-blue-500 rounded-b-xl w-3/4 md:w-1/3 flex flex-col justify-center'>
            <div className='w-full flex justify-center text-white'>
              <h3 className='p-4'>You </h3>
              <h3 className='p-4'>{`${score[0]} - ${score[1]}`}</h3>
              <h3 className='p-4'>Enemy </h3>
            </div>
            <div className='w-full flex justify-center pb-4 text-white'>{myTurn==true ? 'My ' : "Opponent's "}turn</div>
          </div>) : 
           <div className='absolute m-0 b-0 top-0 bg-blue-500 rounded-b-xl w-3/4 md:w-1/3 flex flex-col text-center text-3xl p-4 text-white'>
            Waiting for a friend to join...</div>}
          


        
      </div>
      <div className='grid grid-cols-3 gap-4 justify-center items-center h-1/2 absolute pb-10'>
        {squares.map((item, index) =>
          <div
            className='  rounded-2xl text-center flex items-center justify-center hover:bg-slate-500 cursor-pointer bg-blue-300 size-28 xl:size-44'
            key={index} onClick={() => squareClick(index)}
          >{item}</div>
        )}
      </div>
      <div className='flex flex-col w-1/4 md:w-1/4 justify-center absolute bottom-0'>
        <Link to="/menu" className='text-center m-2 md:m-4 mt-0 p-4 bg-blue-500 rounded-xl' >Menu</Link>
        {/* <button onClick={reset} className='m-2 md:m-4 p-4 bg-blue-500 rounded-xl'>Request reset</button> */}
      </div>
    </>
  )
}

export default Game
