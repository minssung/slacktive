import React from 'react';

class Dashboard extends React.Component {
    render() {
        return(
            <div className="slack-mainDiv">
                {this.props.contents()}
            </div>
        );
    }
}

export default Dashboard;