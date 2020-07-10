import React, { Component } from 'react';

class Tui extends Component {
    constructor(props) {
        super(props);
        this.state = {
            calenderData : this.props.calenderData || [],
        }
    }

    render() {
        return (
            <div className="tui-main">
                
            </div>
        );
    }
}
 
export default Tui;