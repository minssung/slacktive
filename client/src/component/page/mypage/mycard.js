import React from 'react';

export default function Mycard(props) {
    const { cardClick, num } = props;
    return (
        <div className="mycard-main" style={{backgroundImage: props.color}} onClick={() => cardClick(true, num)}>
            <div className="mycard-div">
                <div className="mycard-title">{props.label}</div>
                <div className="mycard-data">{props.data}</div>
                <img src="/img/stars.png" alt="img" className="mycard-img-stars"></img>
                <img src={props.img} alt="img" className="mycard-img-illu"></img>
                <div className="mycard-result">{props.result}</div>
            </div>
        </div>
    );
}