import React from 'react';

class Dashboard extends React.Component {
    render() {
        return(
            <div className="slack-dash">
                {this.props.contents()}
            </div>
        );
    }
}

export default Dashboard;