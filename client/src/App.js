import React from 'react';
import './App.css';
import SlackLoginBtn from './components/SlackLoginBtn';
import HistoryDB from './components/HistoryDB';
import Slack_Dashboard from './components/Slack_Dashboard';

function App() {
  return (
    <div>
        <div className="app-mainDiv">
            {
              !localStorage.getItem("usertoken") ? <SlackLoginBtn /> :
              <div>
                  <Slack_Dashboard />
              </div>
            }
        </div>

        {/** 출근 기록 DB에 담기 */}
        <div>
            <HistoryDB></HistoryDB>
        </div>
    </div>
  );
}

export default App;
