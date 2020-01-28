import React from 'react';
import axios from 'axios';

class Workbtn extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            onWork: '미출근',
            visib: false,
        }
    }

    async messagePost() {
        console.log(this.state)
        const result = await axios.post("http://localhost:5000/slackapi/messagePost",{
            text : this.state.onWork
        });
        this.setState({ 
            visib : !this.state.visib, // 토글 버튼
            onWork : '퇴근'
        });

        console.log(result.data.message.text)
        return result.data;

    }

    async componentDidMount() {
        await axios.get("http://localhost:5000/slackapi/teamUsers");
        var url = (window.location.href).split('?');
        if(url[1]){
            try {
                const resultUser = await axios.get(`http://localhost:5000/user/${url[1]}`);
                this.setState({
                    p_token : resultUser.data.p_token
                })
            } catch(err) {
                console.log(err);
            }
        }
    }

    render() {
        const { p_token } = this.state;
        return (
            <div>
                {
                    p_token ? 
                    <button className="workbtn" onClick={()=>this.messagePost()}>
                        {this.state.visib ? this.state.onWork : this.state.onWork='출근'}
                    </button>
                    : 
                    <a href="http://localhost:5000/login">
                        <img alt="Sign in with Slack" height="40" width="172" 
                        src="https://platform.slack-edge.com/img/sign_in_with_slack.png" 
                        srcSet="https://platform.slack-edge.com/img/sign_in_with_slack.png 1x, 
                        https://platform.slack-edge.com/img/sign_in_with_slack@2x.png 2x" />
                    </a>
                }
            </div>
          );
    }
  
}

export default Workbtn;
