import React from 'react';
import axios from 'axios';

class Workbtn extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            onWork: '미출근',
            visib: false
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

    async teamUsers() {
        const result = await axios.get("http://localhost:5000/slackapi/teamUsers");
        return result.data
    }

    componentDidMount() {
        this.teamUsers();
    }

    render() {

        

        return (
            <div>
                {/* <button className="workbtn" onClick={() => {
                    this.messagePost();
                }}>출근</button> */}
                <button className="workbtn" onClick={()=>this.messagePost()}>
                    {this.state.visib? this.state.onWork : this.state.onWork='출근'}
                </button>
            </div>
          );
    }
  
}

export default Workbtn;
