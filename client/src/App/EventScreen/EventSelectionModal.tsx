import Modal from 'react-modal';
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { GrClose } from 'react-icons/gr'
import { Box, Button, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

// Custom modal style
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

function EventSelectionModal(props: any) {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [modalIsOpen, setIsOpen] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState(-1);

    useEffect(() => {
        console.log(selectedEvent);
        
    }, [selectedEvent])

    // Run when the modal closes.
    function closeModal() {
        setIsOpen(false);
    }

    function afterOpenModal() {
        // references are now sync'd and can be accessed.


    }

    return (
        <Modal
            isOpen={modalIsOpen}
            onAfterOpen={afterOpenModal}
            onRequestClose={closeModal}
            style={customStyles}
            contentLabel="Select Event Modal"
            ariaHideApp={false}>
            <Box className="modal-header-div">
                {/* {t('event.select-active')} */}
            </Box>
            <div className="modal-close-div" onClick={closeModal} >
                <GrClose className='modal-close' />
            </div>
            <Box className="modal-body">
            <FormControl required>
                    <FormLabel sx={{fontSize:25}} id="radio-buttons-events">{t("event.select-active")}</FormLabel>
                    <RadioGroup
                    className="Event-Input-Type"
                    aria-labelledby="demo-radio-buttons-group-label"
                    name="radio-buttons-group"
                        onChange={e => setSelectedEvent(parseInt((e.target as HTMLInputElement).value))}
                        >
                        {props.events.filter((event:any) => event.saved !== 0).map((event:any) => (
                            <FormControlLabel key={event.ID} value={event.ID} control={
                                <Radio 
                                sx={{
                                    '& .MuiSvgIcon-root': {
                                      fontSize: 35,
                                    },
                                  }}
                                required
                                />
                            } label={<Typography fontSize={25} className='formControlLabel'>{event.Name}</Typography>} />
                            ))}
                    </RadioGroup>
                </FormControl>
                
            </Box>
            <Button sx={{fontSize:20}}
                className='Event-Select-Button' 
                type='submit' 
                variant="contained"
                onClick={() => {
                    props.setActiveEvent(selectedEvent);
                    navigate('/selection')
                }}
                >
                    {t("event.choose")}
                    </Button>
        </Modal>
    );
}

export default EventSelectionModal;