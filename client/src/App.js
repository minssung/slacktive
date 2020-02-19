import React from 'react';
import './App.css';
import SlackLoginBtn from './components/SlackLoginBtn';
import TuiCalendar from './components/TuiCalendar';
import { BrowserRouter as Router, Route, Switch, Link } from 'react-router-dom';
import SlackDash from './components/Slack_Dashboard';

let token = "";
function tokenState(tokenstate) {
    if(tokenstate === "on"){
        return token = "on"
    }
}
function App() {
  return (
    <div>
        <Router>
            <Switch>
            <div className="app-mainDiv">
                    {
                      !localStorage.getItem("usertoken") && token !== "on" ? 
                      <Route exact path="/"><SlackLoginBtn /></Route> 
                      :
                      <div className="app-contentDiv">
                          <div className="app-rightDiv">
                              <Link to="/">Calendar</Link>
                              <Link to="/my">My</Link>
                              <Link to="/cedar">Cedar</Link>
                              <Link to="/etc">...</Link>
                          </div>
                          <Route exact path="/">
                              <TuiCalendar tokenstate={tokenState.bind(this)}/>
                              <div className="app-leftDiv">
                                  <SlackDash></SlackDash>
                              </div>
                          </Route>
                          <Route path="/my"></Route>
                          <Route path="/cedar"></Route>
                          <Route path="/etc"></Route>
                      </div>
                    }
            </div>
            </Switch>
        </Router>
    </div>
  );
}

export default App;
