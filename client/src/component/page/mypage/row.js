import React from 'react';

export default function Row(props) {
    return (
        <div className="row-main">
            <div className="row-date">{props.date}</div>
            <div className="row-rowData">{props.rowData || props.notData}</div>
        </div>
    );
}