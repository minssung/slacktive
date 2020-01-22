import React from 'react';
import Clock from 'react-live-clock';

class Time extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        }
    }

    render() {

        return (
            <div>
                <div>
                    <Clock format={'YYYY년 MM월 DD일'} ticking={true} timezone={'Asia/Seoul'} />
                </div>
                <div>
                    <Clock format={'HH:mm:ss'} ticking={true} timezone={'Asia/Seoul'} />
                </div>
            </div>
          );
    }
  
}

export default Time;
