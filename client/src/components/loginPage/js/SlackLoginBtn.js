import React from 'react';
import axios from 'axios';
import loadMask from '../../../resource/loadmaskTest.gif'

let configs = {};
process.env.NODE_ENV === 'development' ? configs = require('../../../devClient_config') : configs = require('../../../client_config');
// if (process.env.NODE_ENV === 'production') {
//     var configs = require('../../../client_config');
// } else if (process.env.NODE_ENV === 'development') {
//     var configs = require('../../../devClient_config');
// }

class SlackLoginBtn extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            result : [],
            loading : null,
        }
    }
    // mount시에 실행
    // -> storage 에 item 확인
    // -> 없을 시 login-access 진행 / -> 있을 시 처리 없음
    async componentDidMount() {
        if(!localStorage.getItem("usertoken")){
            const url = new URL(window.location.href);
            const code = url.searchParams.get("code");
            if(code){
                try {
                    await this.setState({
                        loading : "Loding"
                    })
                    const result = await axios.get(configs.domain+"/login-access",{
                        params : {
                            code
                        }
                    });
                    console.log("jwt user token : "+result.data);
                    localStorage.setItem("usertoken", result.data);
    
                    window.location.href = "/";
                } catch(err) {
                    console.log("code already use err : " + err);
                    window.location.href = "/";
                }
            }
        }
    }
    async ClickSlackLogin() {
        await this.setState({
            loading : "Loding"
        })
        window.location.href = configs.domain+"/login"
    }
    render() {
        const { loading } = this.state;
        return (
            <div className="slacklogin-maindiv">
                {
                    loading && <div className="loadMaskDiv">
                        <img alt="Logind~" src={loadMask} className="loadMask"></img>
                    </div>
                }
                <a onClick={this.ClickSlackLogin.bind(this)} href="/#">
                    <img alt="Sign in with Slack" height="40" width="172" 
                    src="https://platform.slack-edge.com/img/sign_in_with_slack.png" 
                    srcSet="https://platform.slack-edge.com/img/sign_in_with_slack.png 1x, 
                    https://platform.slack-edge.com/img/sign_in_with_slack@2x.png 2x" />
                </a>
            </div>
        );
    }
}

export default SlackLoginBtn;
