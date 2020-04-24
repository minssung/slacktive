import React from 'react';

const MyDashboard = (props) => {
    return (
        <div className={props.classNameDash}>
            {props.contents()}
        </div>
    )
}

export default MyDashboard;