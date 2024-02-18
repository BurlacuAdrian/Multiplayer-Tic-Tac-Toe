import { useState, useEffect, useRef} from 'react'
import './App.css'
import io from 'socket.io-client';
import { BrowserRouter, Route, Routes, Link, useNavigate } from 'react-router-dom';

function Menu() {
  const BASE_URL = 'http://localhost:5173'

  const navigate = useNavigate()
  const [createRoomModal,setCreateRoomModal]=useState(false)
  const [joinRoomModal,setJoinRoomModal]=useState(false)
  const [soloModal,setSoloModal]=useState(false)
  const [createdRoomCode, setCreatedRoomCode] = useState("")
  const [createdRoomURL, setCreatedRoomURL] = useState("")

  const roomToBeJoined = useRef()


  function handleCreateRoomModal(fetchCode){
    if(fetchCode)
      createRoom()
    setCreateRoomModal(value=>!value)
  }

  function handleJoinRoomModal(){
    setJoinRoomModal(value=>!value)
  }

  function handleSoloModal(){
    setSoloModal(value=>!value)
  }
  
  function joinOwnGame(){
    navigate(`/${roomToBeJoined.current}`)
  }

  function joinGame(){
    const roomCode = document.querySelector('#joining-room-code-input').value
    const roomURL = document.querySelector('#joining-room-url-input').value
    // console.log(roomCode)
    // console.log(roomURL)
    if(roomCode!="")
      navigate(`/${roomCode}`)
    else{
      const match = roomURL.match(/\/(\d+)$/);
      const res = match ? match[1] : ""
      navigate(`/${res}`)
    }
  }

  async function createRoom() {
    // socket.emit('create-room')
    const res = await fetch('http://localhost:8001/create-room')
    const data = await res.json();
    const room = data.room

    roomToBeJoined.current=room
    setCreatedRoomCode(room)
    setCreatedRoomURL(BASE_URL+'/'+room)
    
  }
  function info() {
    // socket.emit('info')
  }

  function copyToClipboard(query){
    const inputElement = document.querySelector(query)
    inputElement.select()
    inputElement.setSelectionRange(0, 99999);

    navigator.clipboard.writeText(inputElement.value)

    // document.execCommand("copy")
  }

  function pasteFromClipboard(query){

    const inputElement = document.querySelector(query)
    inputElement.select()
    navigator.clipboard.readText()
      .then(clipboardText => inputElement.value = clipboardText)

  }

  const buttonClass = 'bg-blue-500 text-white text-3xl p-8 rounded-xl my-4'
  const modalStyle = 'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-400 flex flex-col rounded-xl w-1/2 h-1/2 justify-center'
  const modalMenuItem='inline-block mx-auto text-3xl text-black'

  return (
    <>
      <h1 className='text-blue-950 text-4xl'>Multiplayer Tic Tac Toe</h1>
      {/* <h3>Multiplayer</h3> */}
      <div className='flex flex-col justify-center  w-1/4 h-3/5 '>
        <button onClick={()=>handleCreateRoomModal(true)} className={buttonClass}>Create room</button>
        <button onClick={handleJoinRoomModal} className={buttonClass}>Join Room</button>
        
      </div>
      
      {/* To be added */}
      {/* <button onClick={handleSoloModal}>Singleplayer</button> */}

      {createRoomModal && <div
className={modalStyle+""}>
        <span className={modalMenuItem}>Invite a friend!</span>
        <span className={modalMenuItem}>He can either : </span>
        <span className={modalMenuItem+" pt-6"}>Enter room code : </span>
        <span className={modalMenuItem+" "}>
          <input id="created-room-code-input" value = {createdRoomCode} readOnly={true}></input>
          <button onClick={()=>copyToClipboard("#created-room-code-input")}>Clipboard</button>
        </span>
        <br/>
        <span className={modalMenuItem}>Or navigate directly to : </span>
        <span className={modalMenuItem}>
          <input id="created-room-url-input" value={createdRoomURL} readOnly={true}></input>
          <button onClick={()=>copyToClipboard("#created-room-url-input")}>Clipboard</button>
        </span>
        <br/>
        <button className={modalMenuItem+' p-4'} onClick={joinOwnGame}>Join game!</button>
        <button className={modalMenuItem+' p-4'} onClick={handleCreateRoomModal}>Cancel</button>
    </div>}


    {joinRoomModal && <div
      className={modalStyle}
      >
        <span className={modalMenuItem}>Join an existing room</span>
        <span className={modalMenuItem}>You can either : </span>
        <span className={modalMenuItem+" pt-6"}>Enter room code : </span>
        <span className={modalMenuItem}>
          <input id="joining-room-code-input"></input>
          <button onClick={()=>pasteFromClipboard("#joining-room-code-input")}>Clipboard</button>
        </span>
        <br/>
        <span className={modalMenuItem}>Or enter an URL : </span>
        <span className={modalMenuItem}>
          <input id="joining-room-url-input"></input>
          <button onClick={()=>pasteFromClipboard("#joining-room-url-input")}>Clipboard</button>
        </span>
        <br/>
        <button className={modalMenuItem+' p-4'} onClick={joinGame}>Join game!</button>
        <button className={modalMenuItem+' p-4'} onClick={handleJoinRoomModal}>Cancel</button>
    </div>}

    {soloModal && <div
className={modalStyle}      >
        <h2>Solo mode</h2>
        <p>Select an AI difficulty</p>
        <button>Easy</button>
        <button>Medium</button>
        <button>Hard</button>
        <button onClick={handleSoloModal}>Cancel</button>
    </div>}
    </>
  )
}


export default Menu
