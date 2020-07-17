import React from 'react';
import HighlightOffIcon from '@material-ui/icons/HighlightOff';

export default function Partner(props) {
    return (
        <div className="partner-box">
            <img src={props.img || "/img/developer.png"} className="partner-img" alt="img"></img>
            <div className="partner-name">{props.name}</div>
            <div className="partner-delete">
                <HighlightOffIcon onClick={() => props.onRemovePartner(props.data)} style={{width:"19px", height:"19px", cursor:"pointer"}} />
            </div>
        </div>
    );
}