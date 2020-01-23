import React from 'react';
import axios from 'axios';

class Workbtn extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            postMs: []
        }
    }

    async messagePost() {
        const result = await axios.post("http://localhost:5000/slackapi/messagePost");
        //return result.data
        this.setState({
            postMs: result.data,
            
        })
    }

    componentDidMount() {
    }

    render() {

        return (
            <div>
                <button className="workbtn" onClick={() => {
                    this.messagePost();
                }}>출근</button>
            </div>
          );
    }
  
}

export default Workbtn;
