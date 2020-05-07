import React , {Component} from 'react';
import _ from 'lodash';
import './css/Pagination.css';

class Pagination extends Component {
    constructor(props) {
        super(props);
        this.state = {
        }
    }

    // groupPage(index) {
    //     if(index > 5) {
            
    //     }
    // }

    render() {
        const { personCount, pageSize, currentPage, onPageChange } = this.props;
        const maxPage = Math.ceil(personCount / pageSize);
        const pageArray = _.range(1, (maxPage + 1));
        // const pageIndex = pageArray.length;
        // this.groupPage(pageIndex)

        return (
            <nav className="page_container">
                <ul className="page-ul">
                    {
                        pageArray.map(page => {
                            return <li key={page} className={page === currentPage ? "page-li-active" : "page-li"} onClick={() => onPageChange(page)}>
                                {page}
                            </li>
                        })
                    }
                </ul>
            </nav>
        )
    }

}

export default Pagination;