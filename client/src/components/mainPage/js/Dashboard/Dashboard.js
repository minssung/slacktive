import React from 'react';
import char from '../../css/char.png';

const Dashboard = (props) => {
    return(
        <div className="card_container">
            <div className="card_color" style={{
                backgroundColor : props.color()
            }}>
                &nbsp;
            </div>
            <div className="slack-mainDiv">
                <div className="slack-dash">
                    <span className="slack-title">{props.title}</span>
                    <img src={char} alt="char" className="slack-userImg"></img>
                </div>
                <div className="slack-partnerDiv">
                    <span className="slack-partner">{props.partner}</span>
                </div>
                <div className="slack-timeDiv">
                    <span className="slack-textTime">{props.textTime()}</span>
                </div>
            </div>
        </div>
        
    );
}

export default Dashboard;