import React from 'react';
import './css/Employee.css';

class TableInfo extends React.Component {

    render() {

        return <div>
            <div className="info_row">
                <span style={{width: '9%'}}>{this.props.index}</span>
                <span style={{width: '21%'}}>{this.props.name}</span>
                <span style={{width: '12%', color: '#4ea9ff', fontWeight: '500'}}>{this.props.useVac}</span>
                <span style={{width: '12%', color: '#ff4d4d', fontWeight: '500'}}>{this.props.tardy}</span>
                <span style={{width: '12%', color: '#f2994a', fontWeight: '500'}}>{this.props.nightShift}</span>
                <span style={{width: '12%'}}>{this.props.allVac}</span>
                <span style={{width: '9%'}}>{this.props.onWork}</span>
            </div>
            <div className="employee_vertical_2"></div>
        </div>
    }
}

export default TableInfo;