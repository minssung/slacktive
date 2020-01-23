import React from 'react';
import Time from './components/Time';
import './App.css';
import Workbtn from './components/Workbtn';

function App() {
  return (
    <div className="container">
        {/* 현재 시간 */}
        <div className="time_box">
            <div className="time"><Time></Time></div>
        </div>
        
        {/* 출근 버튼 */}
        <div className="work">
            <Workbtn></Workbtn>
        </div>
    </div>
  );
}

export default App;
