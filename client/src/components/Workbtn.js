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
        const { postText, nowChannel } = this.state;
        const result = await axios.post("http://localhost:5000/slackapi/messagePost",{
            channel : nowChannel,
            text : postText
        });
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

                <a href="http://localhost:5000/login">
                    <img alt="Sign in with Slack" height="40" width="172" 
                    src="https://platform.slack-edge.com/img/sign_in_with_slack.png" 
                    srcset="https://platform.slack-edge.com/img/sign_in_with_slack.png 1x, 
                    https://platform.slack-edge.com/img/sign_in_with_slack@2x.png 2x" />
                </a>
            </div>
          );
    }
  
}

export default Workbtn;
