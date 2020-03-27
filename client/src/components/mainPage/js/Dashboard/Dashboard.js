import React from 'react';
import char from '../../css/char.png';

class Dashboard extends React.Component {
    render() {
        return(
            <div className="card_container">
                <div className="card_color" style={{
                    backgroundColor : this.props.color()
                }}>
                    &nbsp;
                </div>
                <div className="slack-mainDiv">
                    <div className="slack-dash">
                        <span className="slack-title">{this.props.title}</span>
                        <img src={char} alt="char" className="slack-userImg"></img>
                    </div>
                    <div className="slack-partnerDiv">
                        <span className="slack-partner">{this.props.partner}</span>
                    </div>
                    <div className="slack-timeDiv">
                        <span className="slack-textTime">{this.props.textTime()}</span>
                    </div>
                </div>
            </div>
            
        );
    }
}

export default Dashboard;