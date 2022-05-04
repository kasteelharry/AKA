import { Container } from 'react-bootstrap'
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import CustomMUIButton from '../../../components/CustomMUIButton';
import makePostRequest from '../../../utils/PostRequests';
import './OverviewContainer.scss'
import OverviewList from './OverviewList';


/**
 * This component shows all the products that were selected for the current transaction. It also contains the confirm button
 * that when pressed finalizes the transaction and sends it to the database to have it processed by the back-end.
 * @param props The props passed by the parent component.
 * @returns Renders the container that will contain all the selected products.
 */
function OverviewContainer(props: any) {

    const navigate = useNavigate();

    /**
     * Sends the transaction to the back-end to have it processed. If successful the transaction
     * is stored in local storage. If failed, the transaction is removed from local storage.
     * TODO inform the user that the transaction has failed.
     * @param selected The selected products and their amounts.
     * @param addNewProductsHook The function that processes the transaction on the front-end.
     */
    function sendTransaction(selected: any[], addNewProductsHook:Function) {

        makePostRequest('http://localhost:8080/api/sales/customers', {
            customerID: props.customerID,
            eventID: props.activeEvent,
            products: selected,
        }).then(data => {
            console.log(data);
                
                selected.forEach(product => {
                    const response = data.result.filter((res:any) => {
                        console.log(res);
                        
                        return res.ProductID === product.id
                    });
                    console.log(response);
                                        
                    product.unitPrice = response[0].UnitPrice;
                    
                    product.customerID = props.customerID;
                    product.customerName = props.customerName;
                    // product.eventID = props.eventID;
                    product.eventID = props.activeEvent;
                    console.log(product);
                    
                    localStorage.setItem(product.timestamp, JSON.stringify(product))
                    product.amount = 0;
                    product.customerID = undefined;
                    product.customerName = undefined;
                })
                selected = []
                localStorage.removeItem('customer')
                addNewProductsHook(selected);
                navigate('/selection')     
        }).catch(error => {
            // TODO inform user that the transaction has failed.
            selected.forEach(product => {
                localStorage.removeItem(product.timestamp);
            })
            navigate('/selection') 
        })
        
    }


    const { t } = useTranslation();

    return (
        <Container className='overview'>
            <div id='overview-menu'>
                <OverviewList selected={props.selected} addNewProductsHook={props.addNewProductsHook} />
            </div>
            <div id='confirm-button'>
            <CustomMUIButton className={'button-overview'} text={t('transaction.confirm')} clickHandler={() => sendTransaction(props.selected, props.addNewProductsHook)}
        sx={{
            fontSize:20,
            backgroundColor: 'primary.dark',
            '&:hover': {
              backgroundColor: 'primary.main',
              opacity: [0.9, 0.8, 0.7],
            },
          }} />
            </div>

        </Container>
    )
}

export default OverviewContainer;