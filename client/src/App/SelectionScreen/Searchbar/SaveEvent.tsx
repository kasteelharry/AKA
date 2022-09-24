import Modal from 'react-modal';
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from 'react-router-dom';
import { Box, Button, InputAdornment } from '@mui/material';
import { GrClose } from 'react-icons/gr';
import TextField from '@mui/material/TextField';
import makeGetRequest from '../../../utils/GetRequests';
import makePutRequest from '../../../utils/PutRequest';
import { clearHistory } from '../../AppContainer';

import './SaveEvent.scss'
import '../../Modal.scss'
import sanitize from 'sanitize-filename';
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

function SaveEvent(props: any) {

    const navigate = useNavigate();
    const { t } = useTranslation();
    const [modalIsOpen, setIsOpen] = useState(true);
    const [flowMeter, setFlowMeter] = useState<number>(0);
    const [oldFlow, setOldFlow] = useState<number>(0);
    const [eventName, setEventName] = useState<string>(' ');
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        if (oldFlow > 0 || loaded) {
            return;
        } else {
            console.log('retrieving old Flow');
            setLoaded(true);
            const oldFlowAmount = localStorage.getItem('flowStand')
            if (oldFlowAmount !== null && oldFlowAmount !== undefined) {
                setOldFlow(parseInt(oldFlowAmount));
            } else {
                makeGetRequest('/api/flowstand/' + props.eventID)
                    .then(result => {
                        console.log('result is:', result.flowstand[0]);

                        const oldFlowStand = result.flowstand[0].StartCount
                        setOldFlow(parseInt(oldFlowStand));
                        localStorage.setItem('flowStand', oldFlowStand)
                    })
            }
        }
    }, [loaded, oldFlow, props.eventID]);

    function closeModal() {
        setIsOpen(false);
        props.saveModal(false);
    }

    function afterOpenModal() {
        // references are now sync'd and can be accessed.

    }

    function setDecimalNum(num: number) {
        return (num / 10).toFixed(1);
    }

    /**
     * Saves the event in the database and redirects the user to the event selection screen.
     */
    function saveEvent() {
        // Save the event and make it inactive
        // TODO handle name change.
        const body = {
            eventID: props.eventID,
            saved: 1
        }
        makePutRequest('/api/events/save', body)
            .then(result => {
                // Delete the local storage saved data
                clearHistory();
                localStorage.removeItem('activeEvent');
                saveFlow();
                // Redirect to event selection screen
                navigate('/event')
            }).catch(err => console.log(err)
            )
    }

    /**
    * Saves the amount stored on the flow meter.
    */
    function saveFlow() {
        console.log('saving flow');

        const body = {
            eventID: props.eventID,
            start: oldFlow,
            end: flowMeter
        }
        makePutRequest('/api/flowstand/update', body)
            .then(result => {
                localStorage.removeItem('flowstand');
            }).catch(err => console.log(err)
            )
        return;
    }

    /**
     * Checks the user input with regards to the flow meter. It checks if
     * the ending value for the flowmeter is greater or equal.
     * @returns true if the flowmeter is equal or more, false if smaller
     */
    function validateInput() {
        if (flowMeter < oldFlow) {
            // TODO set error text
            return false;
        } else {
            return true
        }
    }

    return (
        <Modal
            isOpen={modalIsOpen}
            onAfterOpen={afterOpenModal}
            onRequestClose={closeModal}
            style={customStyles}
            contentLabel="Save event modal"
            ariaHideApp={false}>
            <Box className="modal-header-div">
                {t('event.save')}
            </Box>
            <div className="modal-close-div" onClick={closeModal} >
                <GrClose className='modal-close' />
            </div>
            <Box className="modal-body">
                <Box component="form" onSubmit={(e: any) => {
                    e.preventDefault()
                    saveEvent();
                    console.log('submitted.');


                }} className="Event-Creation">
                    <div className='Save-Input-Name'>
                        <TextField
                            className='Save-Input-Name'
                            required
                            InputProps={{ style: { fontSize: 25 } }}
                            InputLabelProps={{ style: { fontSize: 25 }, shrink: true }}
                            onChange={e => setEventName(sanitize(e.target.value))}
                            label={t("event.name")}
                            value={props.eventName}
                            variant='filled' /> 
                    </div>
                    <div
                            className='Save-Input-Flow-Start'>
                            <TextField
                                className='Save-Input-Flow'
                                InputProps={{ style: { fontSize: 25 } }}
                                InputLabelProps={{ style: { fontSize: 25 }, shrink: true }}
                                required
                                value={(oldFlow / 10).toFixed(1)}
                                disabled={true}
                                label={t("event.flow-old")}
                                type='number'
                                inputProps={{
                                    step: "0.1",
                                    startadornment: <InputAdornment position="start">Litres</InputAdornment>,
                                }}

                                variant='filled' />
                        </div>

                    <div className='Save-Input-Flow-End'>
                        <TextField
                            className='Save-Input-Flow-End'
                            InputProps={{ style: { fontSize: 25 } }}
                            InputLabelProps={{ style: { fontSize: 25 }, shrink: true }}
                            required
                            autoFocus
                            onChange={e => {
                                // TODO Validate on submit
                                const newAmount = (+sanitize(e.target.value)).toFixed(1);
                                const rounded = parseInt((parseFloat(newAmount) * 10).toFixed(1));

                                console.log(rounded);
                                console.log(oldFlow);
                                setFlowMeter(rounded);
                            }}
                            label={t("event.flow")}
                            type='number'
                            inputProps={{
                                step: "0.1",
                                startadornment: <InputAdornment position="start">Litres</InputAdornment>,
                            }}
                            variant='filled' />
                    </div>

                    <div>
                        <Button sx={{ fontSize: 20 }}
                            className='Save-Input-Button'
                            type='submit'
                            disabled={!validateInput()}
                            variant="contained">
                            {t("search.event")}
                        </Button>
                    </div>
                </Box> </Box>

        </Modal>
    )
}

export default SaveEvent;