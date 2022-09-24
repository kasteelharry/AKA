import CustomerDisplay from "./CustomerDisplay";

import './CustomerDisplay.scss'

/**
 * This component builds the customer display screen.
 * @param props The passed props.
 * @returns Renders the customer selection screen.
 */
function CustomerSelection(props: any) {

    return (

        <div className="selection-select-customer">
            {props.customers.filter((customer:any) => 
                customer.Name.toLowerCase().includes(props.query.toLowerCase())
                ).filter((customer:any) => customer.Active === 1).map((customer:any) => (
                
                <CustomerDisplay key={customer.Name+customer.ID} customer={customer} path={customer.path}/>
            ))}
        </div>
    )
}

export default CustomerSelection;