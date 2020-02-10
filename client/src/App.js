import React from 'react';
import './App.css';
import SlackLoginBtn from './components/SlackLoginBtn';
import SlackDashboard from './components/Slack_Dashboard';
import TuiCalendar from './components/TuiCalendar';

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
                  <TuiCalendar />
              </div>
            }
        </div>

    </div>
  );
}

export default App;
