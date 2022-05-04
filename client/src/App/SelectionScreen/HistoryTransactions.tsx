import PreviousTransactions from "./PreviousTransactions/PreviousTransactions";

/**
 * This component makes it possible to see the previous transactions on the entire page.
 * @param props Props passed by the parent component.
 * @returns Renders the previous transactions as a bigger table.
 */
function HistoryTransactions(props: any) {

    return (
        <div className="selection-select-customer">
            <PreviousTransactions query={props.query} setQuery={props.setQuery}
            
            className="selection-select-history"/>
        </div>
        
    )
}

export default HistoryTransactions;