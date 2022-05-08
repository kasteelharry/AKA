import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import CustomMUIButton from "../../../components/CustomMUIButton";

import UpdateTransactionDialog from "./UpdateTransactionDialog";
import CustomAlert from './CustomAlert';
import makePostRequest from '../../../utils/PostRequests';
import makeGetRequest from '../../../utils/GetRequests';

import './PreviousTransactions.scss'

function PreviousTransactions(props: any) {

    const [previous, setPrevious] = useState<any[]>([])
    const [showUpdate, setUpdate] = useState(false)
    const [showError, setError] = useState(false)
    const [historyLoaded, setHistoryLoaded] = useState(false);
    const [previousLoaded, setPreviousLoaded] = useState(false);
    const [transactionToUpdate, setTransactionToUpdate] = useState<any>({})

    const { t } = useTranslation();

    /**
     * Deletes a transaction in the database. If failed it will not notify the user.
     * TODO notify the user if the transaction failed.
     * @param timestamp the timestamp of the transaction to delete.
     */
    function deleteTransaction(timestamp: string) {
        console.log(timestamp);
        const body = {
            timestamp,
        };
        makePostRequest('http://localhost:8080/api/sales/delete', body)
        .then(data => {
                localStorage.removeItem(timestamp);
                const newPrev = previous.filter(transaction => transaction.timestamp !== timestamp);
                setPrevious(newPrev);
        }).catch(err => console.log(err));
    }

    useEffect(() => {      
        if (!historyLoaded) {
            console.log('loading history');
            
            // let eventID = localStorage.getItem('activeEvent');
            console.log('Passed active event is: ', props.activeEvent);
            if (props.activeEvent === undefined) {
                return;
            }
            // if (props.activeEvent ==eventID === undefined || eventID === null) {
            //     console.log('no event found');
                
            //     return;
            // }
            // eventID = sanitize(eventID)
            // retrieveHistoricalData(parseInt(eventID, 10));
            retrieveHistoricalData(props.activeEvent)
            setHistoryLoaded(true);
        }
    }, [historyLoaded]);

    /**
     * Retrieves all historical data from the database for a certain event.
     * @param eventID the id of the event to retrieve data from.
     */
    function retrieveHistoricalData(eventID:number) {
        makeGetRequest('http://localhost:8080/api/sales/events/' + eventID)
        .then(result => {
            const resultArray: any[] = result.sale;
            resultArray.forEach(sale => {
                if (sale.Name !== null) {
                    const entry= {
                        CustomerID: sale.UserID,
                        timestamp: ((new Date(sale.TimeSold)).getTime()),
                        eventID: sale.EventID,
                        customerName: sale.Name,
                        unitPrice: sale.UnitPrice,
                        amount: sale.amount,
                        id: sale.productID,
                        category: sale.category,
                        name: sale.ProductName
                    }
                    
                    localStorage.setItem(entry.timestamp.toString(), JSON.stringify(entry))
                    if (getIndexByTimestamp(entry.timestamp) === -1) {
                        previous.push(entry)
                        setPrevious(previous)
                    }
                }
            });
            
        })
    }
    /**
     * Retrieves all the previous transactions from local storage.
     * Does not care if the transaction went successful and this
     * should be changed in future versions such that failed transactions
     * are not shown while they failed to synchronize with the main database. 
     */
    const setHistory = () => {
        // retrieveHistoricalData()
        // Obtains the keys of all the items in local storage.
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            // If the key is not a timestamp, ignore it.
            if (isValidDate(new Date(+key))) {
                const stored = localStorage.getItem(key);
                if (stored !== null) {
                    // Convert the stored object from string to JSON.
                    const transaction = JSON.parse(stored)
                    // Prevent duplicates being added.
                    if (previous.indexOf(transaction) === -1) {
                        previous.push(transaction);
                    }
                } 
            }
        })
        // Sort the array by the latest timestamp first such that the
        // most recent transaction is shown first in the table.
        previous.sort((a, b) => b.timestamp - a.timestamp)
        setPrevious(previous);
    };

    /**
     * Validates a date object to confirm it is a valid date or not.
     * @param d the Date object that needs to be verified.
     * @returns true if the date is valid; false if invalid.
     */
    function isValidDate(d: Date) {
        return !isNaN(d.getFullYear());
    }
    // Retrieves the previous transactions such that the table can be built.
    // If called from an useEffect hook, the hook will not fire when the component
    // is navigated to after initial component creation.
    if (previous.length === 0 && Object.keys(localStorage).length > 1 && !previousLoaded) {
        setHistory()
        setPreviousLoaded(true)
    }

    if (localStorage.getItem('customer') !== null) {
        localStorage.removeItem('customer');
    }

    function getIndexByTimestamp(timestamp:number):number {
        for (let index = 0; index < previous.length; index++) {
            const transaction = previous[index];
            if (transaction.timestamp === timestamp) {
                return index;
            } 
        }
        return -1;
    }

    useEffect(() => {
        if (transactionToUpdate.amount === undefined) {
            localStorage.removeItem(transactionToUpdate.timestamp)
                const newPrev = previous.filter(transaction => transaction.timestamp !== transactionToUpdate.timestamp);
                setPrevious(newPrev);
                if (transactionToUpdate.timestamp !== undefined) {
                    setError(true);
                }
            return;
        }
        console.log(transactionToUpdate.amount);
        
        if (transactionToUpdate.amount !== undefined) {
            const index = getIndexByTimestamp(transactionToUpdate.timestamp);
            console.log(previous[index].amount);
            
            if (index > -1) {
                localStorage.setItem(transactionToUpdate.timestamp, JSON.stringify(transactionToUpdate));
                previous[index] = transactionToUpdate;
                setPrevious(previous);
            }
        }
    }, [transactionToUpdate])


    return (
        <div className={props.className === undefined ? "previous-transaction-div" : props.className}>
            <TableContainer component={Paper}>
                <Table sx={{fontSize:20, minWidth: 650 }} aria-label="simple table">
                    <TableHead>
                        <TableRow >
                            <TableCell sx={{fontSize:20}}>{t("previous.name")}</TableCell>
                            <TableCell sx={{fontSize:20}} align="right">{t("previous.product")}</TableCell>
                            <TableCell sx={{fontSize:20}} align="right">{t("previous.category")}</TableCell>
                            <TableCell sx={{fontSize:20}} align="right">{t("previous.amount")}</TableCell>
                            <TableCell sx={{fontSize:20}} align="right">{t("previous.price")}</TableCell>
                            <TableCell sx={{fontSize:20}} align="right">{t("previous.timestamp")}</TableCell>
                            <TableCell sx={{fontSize:20}} align="right">{t("previous.update")}</TableCell>
                            <TableCell sx={{fontSize:20}} align="right">{t("previous.delete")}</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {previous.filter((transaction: any) => transaction.customerName.toLowerCase().includes(props.query.toLowerCase()))
                            .map((transaction: any) =>
                                <TableRow
                                    key={transaction.timestamp}
                                    sx={{ fontSize:200, '&:last-child td, &:last-child th': { border: 0 } }}
                                >
                                    <TableCell sx={{fontSize:20}} component="th" scope="row">
                                        {transaction.customerName}
                                    </TableCell>
                                    <TableCell sx={{fontSize:20}} align="right">{transaction.name}</TableCell>
                                    <TableCell sx={{fontSize:20}} align="right"> {transaction.category[0].categoryName}</TableCell>
                                    <TableCell sx={{fontSize:20}} align="right">{transaction.amount}</TableCell>
                                    <TableCell sx={{fontSize:20}} align="right">{
                                        ((transaction.unitPrice * transaction.amount) / 100).toLocaleString("nl-nl", { style: "currency", currency: "EUR" })
                                    }</TableCell>
                                    <TableCell sx={{fontSize:20}} align="right">{
                                        (new Date(transaction.timestamp)).toLocaleString("nl-nl")
                                    }</TableCell>
                                    <TableCell sx={{fontSize:20}} align="right"><CustomMUIButton className={'button-table'} text={t("transaction.update")} clickHandler={() => {
                                        setUpdate(!showUpdate)
                                        if (transaction === undefined) {
                                            setUpdate(!showUpdate)
                                        } else {
                                            setTransactionToUpdate(transaction);
                                        }
                                        
                                    }
                                    } /></TableCell>
                                    <TableCell sx={{fontSize:20}} align="right"><CustomMUIButton className={'button-table'} text={t("transaction.delete")} clickHandler={() => deleteTransaction(transaction.timestamp)} /></TableCell>
                                </TableRow>
                            )}
                    </TableBody>
                </Table>
            </TableContainer>
            {showUpdate && <UpdateTransactionDialog transaction={transactionToUpdate} setTransactionToUpdate={setTransactionToUpdate} setUpdate={setUpdate} />}
            {showError && <CustomAlert setError={setError}/>}
        </div>
    )
}

export default PreviousTransactions;