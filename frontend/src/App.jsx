import React from 'react';
import {useState} from 'react';
import SignUp from './components/SignUp';
import SignIn from './components/SignIn';
import { BrowserRouter as PrivateRouter, Route, Routes } from 'react-router-dom';

function App() {
  return(
    <PrivateRouter>
      <Routes>
        <Route path="/" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />
      </Routes>
    </PrivateRouter>
  )

}

export default App;
