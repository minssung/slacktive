import React from 'react';

export default function History(props) {
    const { label, data, state } = props;
    let color = null;

    switch (label) {
        case "반차": color = "#d6ff98"; break;
        case "휴가": color = "#87dffa"; break;
        case "대휴": color = "#b1c1ff"; break;
        case "병가": color = "#fddb87"; break;
        default: color = "#d6ff98"; break;
    }

    return (
        <div className="history-main">
            <div className="history-title" style={{backgroundColor: color}}>
                <span>{label}</span>
                <div className="history-none"></div>
            </div>
            {
                state && <div className="history-state">[예정]</div>
            }
            <div className="history-data" style={!state ? {color: "#a7a7a7"} : {} }>{data}</div>
        </div>
    );
}