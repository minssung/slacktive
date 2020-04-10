import React from 'react';

class TableInfo extends React.Component {

    render() {

        return <tr>
            <td>{this.props.index}</td>
            <td>{this.props.name}</td>
            <td>{this.props.useVac}</td>
            <td>{this.props.tardy}</td>
            <td>{this.props.nightShift}</td>
            <td>{this.props.allVac}</td>
            <td>{this.props.onWork}</td>
        </tr>
    }
}

export default TableInfo;