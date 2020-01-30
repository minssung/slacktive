import React from 'react';
import Time from './components/Time';
import './App.css';
import SlackLoginBtn from './components/SlackLoginBtn';
import HistoryDB from './components/HistoryDB';

function App() {
  return (
    <div className="container">
        {/* 현재 시간 */}
        <div className="time_box">
            <div className="time"><Time></Time></div>
        </div>
        
        {/* 출근 버튼 */}
        <div className="work">
            <SlackLoginBtn />
        </div>

        {/** 출근 기록 DB에 담기 */}
        <div>
            <HistoryDB></HistoryDB>
        </div>
    </div>
  );
}

export default App;
