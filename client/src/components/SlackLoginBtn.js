import React from 'react';
import axios from 'axios';

class SlackLoginBtn extends React.Component {
    // mount시에 실행
    // -> storage 에 item 확인 
    // -> 없을 시 login-access 진행 / -> 있을 시 처리 없음
    async componentDidMount() {
        if(!localStorage.getItem("usertoken")){
            const url = new URL(window.location.href);
            const code = url.searchParams.get("code");
            if(code){
                const result = await axios.get("http://localhost:5000/login-access",{
                    params : {
                        code
                    }
                });
                console.log("jwt user token : "+result.data);
                localStorage.setItem("usertoken", result.data);

                window.location.href = "/";
            }
        }
    }
    render() {
        return (
            <div className="slacklogin-maindiv">
                <a href="http://localhost:5000/login">
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
