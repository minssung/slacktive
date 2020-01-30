import React from 'react';
import Dashboard from './Dashboard/Dashboard';

class Slack_Dashboard extends React.Component {
    render () {
        return (
            <div className="slack-mainDiv">
                <div className="slack-dashboardDiv">
                    <Dashboard />
                    <Dashboard />
                    <Dashboard />
                </div>
            </div>
        );
    }
}

export default Slack_Dashboard;