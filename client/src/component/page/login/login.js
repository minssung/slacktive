import React from 'react';
import axios from 'axios';
import '../../css/login.css';

import CircularProgress from '@material-ui/core/CircularProgress';

let configs = {};
process.env.NODE_ENV === 'development' ? configs = require('../../../devClient_config') : configs = require('../../../client_config');

class SlackLoginBtn extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            result : [],
            loading : false,
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
                        loading : true
                    })
                    const result = await axios.get(configs.domain+"/login-access",{
                        params : {
                            code
                        }
                    });
                    console.log("jwt user token : "+result.data);
                    localStorage.setItem("slacklogin", result.data);
                    window.location.href = "/";
                } catch(err) {
                    console.log("code already use err : " + err);
                }
            }
        }
        this.setState({ loading : false });
    }
    async clickSlackLogin() {
        this.setState({ loading : true })
        window.location.href = configs.domain+"/login"
    }
    render() {
        const { loading } = this.state;
        return (
            <div className="login-main">
                {
                    loading && <div className="load-mask">
                        <CircularProgress style={{width:"100px",height:"100px"}} />
                    </div>
                }
                <button className="login-btn" onClick={this.clickSlackLogin.bind(this)} >
                    <img alt="Sign in with Slack" height="40" width="172" 
                    src="https://platform.slack-edge.com/img/sign_in_with_slack.png" 
                    srcSet="https://platform.slack-edge.com/img/sign_in_with_slack.png 1x, 
                    https://platform.slack-edge.com/img/sign_in_with_slack@2x.png 2x" />
                </button>
            </div>
        );
    }
}

export default SlackLoginBtn;
