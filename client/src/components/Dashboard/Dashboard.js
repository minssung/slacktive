import React from 'react';
import Clock from 'react-live-clock';
import axios from 'axios';

class Dashboard extends React.Component {
    constructor(props){
        super(props);
        this.state = {

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
        return(
            <div className="slack-dash">
                <span>
                    <Clock format={'YYYY년 MM월 DD일'} ticking={true} timezone={'Asia/Seoul'} /><br></br>
                    <Clock format={'HH:mm:ss'} ticking={true} timezone={'Asia/Seoul'} />
                </span>
            </div>
        );
    }
}

export default Dashboard;