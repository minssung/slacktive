import React from 'react';
import axios from 'axios';

class HistoryDB extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            ch : "CSZTZ7TCL"
        }
    }

    async History() {
        const result = await axios.post("http://localhost:5000/slackapi/channelHistory",{
            chname : this.state.ch
        });
        return result.data;
        
    }

    componentDidMount() {
    //     this.interval = setInterval( () => {
    //         this.History();
    //     }, 1000 * 60 * 60);
        
        //this.History();
    }

    componentWillUnmount() {
        //clearInterval(this.interval)
    }

    render() {

        return (
            <div>
                {

                }
            </div>
          );
    }
}

export default HistoryDB;