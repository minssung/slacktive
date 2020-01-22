import React from 'react';
import Time from './components/Time';
import './App.css';

function App() {
  return (
    <div className="container">
        <div className="time_box">
            <div className="time"><Time></Time></div>
        </div>
        
        <div className="work">
            <button className="workbtn">출근</button>
        </div>
    </div>
  );
}

export default App;
