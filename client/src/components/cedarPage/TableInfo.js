import React from 'react';
import './css/Employee.css';

class TableInfo extends React.Component {

    render() {

        return <div>
            <div className="info_row">
                <span style={{width: '6%'}}>{this.props.index}</span>
                <span style={{width: '25%'}}>{this.props.name}</span>
                <span style={{width: '15%', color: '#4ea9ff'}}>{this.props.useVac}</span>
                <span style={{width: '13%', color: '#ff4d4d'}}>{this.props.tardy}</span>
                <span style={{width: '13%', color: '#f2994a'}}>{this.props.nightShift}</span>
                <span style={{width: '10%'}}>{this.props.allVac}</span>
                <span style={{width: '6%'}}>{this.props.onWork}</span>
            </div>
            <div className="employee_vertical_2"></div>
        </div>
    }
}

export default TableInfo;