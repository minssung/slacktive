import React from 'react';

class MyDashboard extends React.Component {
    render () {
        return (
            <div className="mypage-Dash">
                {this.props.contents()}
            </div>
        )
    }
}

export default MyDashboard;