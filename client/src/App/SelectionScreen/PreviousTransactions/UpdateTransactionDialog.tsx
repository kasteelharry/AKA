import { useState } from "react";
import { useTranslation } from "react-i18next";
import Modal from 'react-modal';
import { GrClose } from 'react-icons/gr'
import TextField from '@mui/material/TextField';


import './UpdateTransactionDialog.scss';
import CustomMUIButton from "../../../components/CustomMUIButton";
import { Box } from "@mui/material";
import makePostRequest from "../../../utils/PostRequests";



const customStyles = {
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
        borderRadius: '30px'
    },
    overlay: {
        zIndex: 1000,
        borderRadius: '30px'

    }
};

/**
 * This component renders a modal that is used to update transactions.
 * @param props Properties passed by the parent component.
 * @returns Renders the modal where transaction can be updated.
 */
function UpdateTransactionDialog(props: any) {

    const { t } = useTranslation();
    const [modalIsOpen, setIsOpen] = useState(true);
    const [amount, setAmount] = useState(props.transaction === undefined ? 0 : props.transaction.amount);

    /**
     * This function updates the transaction that was selected. It performs a POST
     * request to the back-end database and if failed it let's the user know. 
     */
    function updateTransaction() {  
        const body = {
                        timestamp: props.transaction.timestamp,
                        eventID: props.transaction.eventID,
                        productID: props.transaction.id,
                        amount: amount,
                        customerID: props.transaction.customerID
                    }
        makePostRequest('/api/sales/update', body)
        .then(result => {
            props.transaction.amount = amount;
                const newTransaction = {...props.transaction};
                console.log(props.transaction);
                
                    props.setTransactionToUpdate(newTransaction);
                    closeModal();
        })
        .catch(err => {
            const failed:any = {
                timestamp : props.transaction.timestamp
            }
            props.setTransactionToUpdate(failed);
            closeModal();
            
        })
    }


    function afterOpenModal() {
        // references are now sync'd and can be accessed.


    }

    function closeModal() {
        props.setTransactionToUpdate({})
        props.setUpdate(false);
        setIsOpen(false);
    }

    return (
        <Modal
            isOpen={modalIsOpen}
            onAfterOpen={afterOpenModal}
            onRequestClose={closeModal}
            style={customStyles}
            contentLabel="Update Modal"
            ariaHideApp={false}
        >
            <div>
                <Box className="modal-header-div">
                    {t('previous.update-product')}
                </Box>
                <div className="modal-close-div" onClick={closeModal} >
                    <GrClose className='modal-close' />
                </div>
                <Box className="modal-body">
                    <TextField
                        id="filled-number"
                        label={t("previous.amount")}
                        type="number"
                        InputLabelProps={{
                            shrink: true,
                            style: { fontSize: 20 }
                        }}
                        variant="filled"
                        InputProps={{ style: { fontSize: 25 } }}
                        defaultValue={amount}
                        autoFocus
                        required
                        onChange={(e) => {
                            const newAmount = parseInt(e.target.value, 10);
                            if (newAmount <= 1) {
                                e.target.value = '1'; 
                            }
                            setAmount(e.target.value);

                        }}
                    />
                </Box>
                <Box>
                <CustomMUIButton
                className={'button-modal'}
                text={t("transaction.confirm")}
                clickHandler={updateTransaction} />
                </Box>
            </div>
        </Modal>
    );
}

export default UpdateTransactionDialog;