import React from 'react';
// import './App.css';
import './App_.css';
// import IndexRoot from './components/indexRoot';
import Base from './component/layout/base';

import { MuiPickersUtilsProvider } from '@material-ui/pickers';

// pick a date util library
import DateFnsUtils from '@date-io/date-fns';

function App() {
    return (
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <div className="app-main">
                <Base />
            </div>
        </MuiPickersUtilsProvider>
    );
}

export default App;
