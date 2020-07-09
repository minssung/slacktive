import React from 'react';

export default function Etccard(props) {
    const { title, content, date, color } = props;
    return (
        <div className="etc-card" style={{backgroundImage: color }}>
            <div className="etc-card-margin">
                <div className="etc-card-title">{title}</div>
                <div className="etc-card-content">{content}</div>
                <div className="etc-card-date">{date}</div>
                <img src="/img/stars.png" alt="img" className="etc-card-img"></img>
            </div>
        </div>
    );
}