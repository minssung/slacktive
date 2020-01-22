import React from 'react';
import axios from 'axios';

class Workbtn extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            postMs: [],
            postText: '출근',
            nowChannel: 'CSMN5L4KY'
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

        const { postMs } = this.state;

        console.log(postMs);
        

        return (
            <div>
                <button className="workbtn" onClick={()=> {
                    this.setState({
                        nowChannel: postMs.channel,
                        postText: postMs.text
                    }, () => {this.messagePost();})
                }}>출근</button>
            </div>
          );
    }
  
}

export default Workbtn;
