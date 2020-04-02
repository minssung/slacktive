import React from 'react';

class MyDashboard extends React.Component {
    render () {
        return (
            <div className={this.props.classNameDash}>
                {this.props.contents()}
            </div>
        )
    }
}

export default MyDashboard;