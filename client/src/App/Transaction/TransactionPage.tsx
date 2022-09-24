import { Box } from '@mui/material';
import { useEffect, useState } from 'react';
import { Container } from 'react-bootstrap'
import { useNavigate, useParams } from 'react-router-dom';

import CategoryContainer from './Category/CategoryContainer';
import OverviewContainer from './Overview/OverviewContainer';
import ProductContainer from './Product/ProductContainer';

import './TransactionPage.scss';

/**
 * This component renders the entire transaction page and the child components
 * that build the entire page.
 * @param props Properties passed by the parent component.
 * @returns Renders the container for the transaction page.
 */
function TransactionPage(props?: any) {


    // The states of this component.
    // Selected is the state that keeps track of all the products
    // that have been selected.
    const [selected, setSelected] = useState<any[]>([]);
    // Active category keeps track of the category that was selected.
    const [activeCategory, setActiveCategory] = useState<number>(1);
    // The id of the customer that is used in the parameters.
    const { customerID } = useParams()
    // The name of the customer. Initially empty but set through a query to the back-end
    // TODO change this to use local storage.
    const [customer, setCustomer] = useState<any>({})
    const navigate = useNavigate();

    /**
     * Retrieves the customer ID from the local storage and set the customer state.
     */
    function setCustomerHook() {
        const customerLocal = localStorage.getItem('customer');
        if (customerLocal === null) {
            navigate('/selection')
        } else {
            setCustomer(JSON.parse(customerLocal));
        }
    }

    useEffect(() => {
        if (customerID === undefined) {
            return;
        }
        setCustomerHook();

    }, [customerID])

    function addNewProductsHook(newValue: any[]) {
        setSelected([...newValue]);
    }

    function changeCategoryHook(newValue: number) {
        setActiveCategory(newValue);
    }

    return (
        <Container className='transaction'>
            <div id='category-container'>
                <CategoryContainer activeCategory={activeCategory} setActiveCategory={changeCategoryHook} />
            </div>
            <div id='product-container'>
                <Box sx={{fontSize:30}}>{customer.Name}</Box>
                <ProductContainer addNewProductsHook={addNewProductsHook} selected={selected} activeCategory={activeCategory} />
            </div>
            <div id='overview-container'>
                <OverviewContainer addNewProductsHook={addNewProductsHook} selected={selected} customerName={customer.Name} customerID={customerID} activeEvent={props.activeEvent} />
            </div>

        </Container>
    )
}

export default TransactionPage;