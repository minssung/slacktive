import React from 'react';
import './App.css';
import SlackLoginBtn from './components/SlackLoginBtn';
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
    </div>
  );
}

export default App;
