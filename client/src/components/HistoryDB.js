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

        console.log(result.data)
        return result.data;

    }

    componentDidMount() {
        this.History();
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
