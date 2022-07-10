import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BsSearch } from 'react-icons/bs';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';


import './SelectionSearchBar.scss';
import { Typography } from '@mui/material';
import makeGetRequest from '../../../utils/GetRequests';
import SaveEvent from './SaveEvent';


/**
 * This component contains the search bar, the input field and the show history button.
 * @param props Properties passed by the parent component.
 * @returns Renders the search bar.
 */
function SelectionSearchBar(props: any) {

    const { t } = useTranslation();
    // textInput must be declared here so the ref can refer to it
    const textInput = useRef<HTMLInputElement>(null);
    const [eventName, setEventName] = useState('');
    const [eventNameLoaded, setLoaded] = useState(false);
    const [saveModal, setSaveModal] = useState(false);

    useState(() => {
        // Only run this once
        if (eventNameLoaded) {
            return;
        } else {
            // Get the name of the event from the database.
            makeGetRequest(('/api/events/' + props.activeEvent))
                .then(result => {
                    setEventName(result.events[0].Name);
                    // Set the hook to ensure the request is just run once.
                    setLoaded(true);
                })
                .catch(err => console.log(err));
        }
    })

    // Change the focus back to the search bar if the modal closes again.
    useEffect(() => {
        if (!saveModal) {
            // Ensure that the text input does indeed exits
            if (textInput.current !== null) {
                textInput.current.focus();
            }
        }
    }, [saveModal])

    /**
     * Ensures that the focus is returned to the input field.
     */
    function clickHandler() {
        if (textInput.current !== null) {
            textInput.current.focus();
        }
        props.setHistory(!props.history)
    }

    return (

        <div className="selection-search-container">
            <BsSearch className='search-icon' />
            <TextField
                id="outlined-basic"
                label={t('search.box')}
                size="medium"
                variant="outlined"
                onChange={
                    event => props.setQuery(event.target.value)
                }
                autoComplete='off'
                inputRef={textInput}
                className='search-input'
                autoFocus={true}
                placeholder={t('search.box')} />
            <Button
                color='primary'
                variant="contained"
                disabled={false}
                type={'button'}
                className='showHistory'
                onClick={() => clickHandler()} >
                {t('search.history')}
            </Button>
            <Typography className='event-name' variant="h4" component='div' gutterBottom>
                {t("search.active") + eventName}
            </Typography>
            <Button
                color='primary'
                variant="contained"
                disabled={false}
                type={'button'}
                className='saveEvent'
                onClick={() => setSaveModal(true)} >
                {t('search.event')}
            </Button>
            {saveModal && <SaveEvent saveModal={() => setSaveModal(false)} eventName={eventName} setEventName={setEventName} eventID={props.activeEvent}/>}
        </div>

    )
}

export default SelectionSearchBar;