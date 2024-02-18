import { useState,useEffect } from 'react'
import './App.css'
import io from 'socket.io-client';
import { BrowserRouter, Route, Routes,useNavigate } from 'react-router-dom';
import Menu from './Menu.jsx';
import Game from './Game.jsx';

function App() {


 

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/menu' element={<Menu
        />} />
        <Route path='/' element={<Menu
        />} />
        <Route path='/:room' element={<Game/>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App
