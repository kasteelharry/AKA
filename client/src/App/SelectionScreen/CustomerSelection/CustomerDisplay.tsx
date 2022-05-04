import { useNavigate } from "react-router-dom";

/**
 * This component builds the singular customer display.
 * @param props Properties passed by the parent component.
 * @returns Renders the customer display for a single customer.
 */
function CustomerDisplay(props: any) {

    const image = props.path

    const navigate = useNavigate();
    const startTransaction = () => {
        localStorage.setItem('customer', JSON.stringify(props.customer));
        const path = '/transaction/' + props.customer.ID;
        navigate(path);
    }

    return (
        <div className='display-wrapper' onClick={startTransaction}>
            <div className="display-overlay" >
            <div className="customer-name">{props.customer.Name}</div>
            </div>
            <img className='customer-image' src={image} alt='not found'/>
            
        </div>
    )
}

export default CustomerDisplay;