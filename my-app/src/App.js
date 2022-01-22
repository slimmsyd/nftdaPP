import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';

import Mint from './Mint'; 
import Home from './Home'

const App = () => { 

    return ( 
    <div className = "wrapper">
        <BrowserRouter>
            <Routes>
            <Route exact path = "/" element = {<Home />}>
                </Route>
                <Route exact path = "/mint" element = {<Mint />}>
                </Route>
                
            </Routes>
        </BrowserRouter>

    
    </div>

    )


}


export default App