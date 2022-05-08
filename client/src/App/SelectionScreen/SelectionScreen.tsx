import React, { useEffect, useState } from 'react';
import Container from 'react-bootstrap/Container';
import CustomerSelection from './CustomerSelection/CustomerSelection';
import HistoryTransactions from './HistoryTransactions';
import PreviousTransactions from './PreviousTransactions/PreviousTransactions';
import SelectionSearchBar from './Searchbar/SelectionSearchBar';
import sanitize from 'sanitize-filename';

import './SelectionScreen.scss';
import { useNavigate } from 'react-router-dom';
import makeGetRequest from '../../utils/GetRequests';

/**
 * This component has the entire selection screen.
 * @param props the properties passed by the parent component.
 * @returns Renders the page and all its child components.
 */
function SelectionScreen(props:any) {

    // The search bar query input
    const [query, setQuery] = useState("");
    // If the history page has to be shown or not.
    const [history, setHistory] = useState(false);
    // All the customers after being loaded from the back-end.
    const [customers, setCustomers] = useState<any[]>([]);

    const navigate = useNavigate()

    /**
     * Tries to obtain the image for a customer. If there is no image
     * found for the customer, it returns the placeholder image. 
     * @param path The path of the image trying to be found.
     * @returns Either the path of the image or the placeholder.
     */
    const tryRequire = (path: string) => {
        try {
            return require('../../images/' + sanitize(path) + '.jpg');
        } catch (err) {
            return require('../../images/placeholder.jpg');
        }
    };

    
    useEffect(() => {
        makeGetRequest("http://localhost:8080/api/customers")
    .then(result => {
        if (result.customer === undefined || result.customer.length === 0) {
            return;
        }
        // Load the image paths.
        result.customer.forEach((cust: any) => {
            cust.path = tryRequire(sanitize(cust.ID))
        })
        setCustomers(result.customer)
    }).catch(error => navigate('/login'))

    }, [navigate])

    return (
        <Container className="selectionScreen">
                <div className={history ? 'selection-container-history' : "selection-container"}>
                    <SelectionSearchBar query={query} setQuery={setQuery} history={history} setHistory={setHistory} activeEvent={props.activeEvent}/>
                    {!history && <CustomerSelection customers={customers} query={query} setQuery={setQuery}  />}
                    {history && <HistoryTransactions query={query} setQuery={setQuery} />}
                    {!history && <PreviousTransactions query='' activeEvent={props.activeEvent} />}
                    {history}
                    
                </div>
        </Container>
            
            
    )
}

export default SelectionScreen;