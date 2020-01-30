import React from 'react';
import axios from 'axios';

class SlackLoginBtn extends React.Component {
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

                this.usersTokenChecked();
            }
        } else {
            console.log("localstorage already");
            localStorage.removeItem("usertoken");
            console.log("localstorage remove usertoken!");
        }
    }

    async usersTokenChecked(){
        const result = await axios("http://localhost:5000/verify",{
            method : "get",
            headers : {
                'content-type' : 'text/json',
                'x-access-token' : localStorage.getItem("usertoken")
            }
        });
        console.log("jwt token verifyed result : " + result.data.userid);
    }

    render() {
        return (
            <div>
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
