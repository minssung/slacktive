import React from 'react';
import './App.css';
import SlackLoginBtn from './components/SlackLoginBtn';
import SlackDashboard from './components/Slack_Dashboard';
import HistoryDB from './components/HistoryDB';

let token = "";
function tokenState(tokenstate) {
    if(tokenstate === "on"){
        return token = "on"
    }
}
function App() {
  return (
    <div>
        <div className="app-mainDiv">
            {
              !localStorage.getItem("usertoken") && token !== "on" ? <SlackLoginBtn /> :
              <div>
                  <SlackDashboard tokenstate={tokenState.bind(this)}/>
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
