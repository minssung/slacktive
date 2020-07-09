import React from 'react';

export default function Card(props) {
    return (
        <div className="card-index">
            <div className="card-border"></div>
            <div className="card-box">
                <div className="card-top">
                    <div className="card-title">{"강남 출장 ..."}</div>
                    <div>
                        <img src="/img/developer.png" alt="img" className="card-img"></img>
                    </div>
                </div>
                <div className="card-member">{"가을, 지혜"}</div>
                <div className="card-date">{"2.4(호) ~ 2.7(금)"}</div>
            </div>
        </div>
    );
}