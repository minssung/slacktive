import React from 'react';

class Dashboard extends React.Component {
    render() {
        return(
            <div className="card_container">
                <div className="card_color">
                    &nbsp;
                </div>
                <div className="slack-mainDiv">
                {this.props.contents()}
                </div>
            </div>
            
        );
    }
}

export default Dashboard;