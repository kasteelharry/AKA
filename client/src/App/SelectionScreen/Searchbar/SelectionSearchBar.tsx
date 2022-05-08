import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BsSearch } from 'react-icons/bs';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';


import './SelectionSearchBar.scss';
import { clearHistory } from '../../AppContainer';
import { useNavigate } from 'react-router-dom';
import makePutRequest from '../../../utils/PutRequest';
import { Typography } from '@mui/material';
import makeGetRequest from '../../../utils/GetRequests';
import sanitize from 'sanitize-filename';


/**
 * This component contains the search bar, the input field and the show history button.
 * @param props Properties passed by the parent component.
 * @returns Renders the search bar.
 */
function SelectionSearchBar(props: any) {

    const navigate = useNavigate();
    const { t } = useTranslation();
    // textInput must be declared here so the ref can refer to it
    const textInput = useRef<HTMLInputElement>(null);
    const [eventName, setEventName] = useState('');
    const [eventNameLoaded, setLoaded] = useState(false);

    useState(() => {
        console.log(props.activeEvent);
        
        if (eventNameLoaded) {
            return;
        } else {
            makeGetRequest(('http://localhost:8080/api/events/' + props.activeEvent))
                .then(result => {
                    setEventName(result.events[0].Name);
                    setLoaded(true);
                })
                .catch(err => console.log(err));
        }
    })

    /**
     * Ensures that the focus is returned to the input field.
     */
    function clickHandler() {
        if (textInput.current !== null) {
            textInput.current.focus();
        }
        props.setHistory(!props.history)
    }

    /**
     * Saves the event in the database and redirects the user to the event selection screen.
     */
    function saveEvent() {
        // Request flowmeter end amount
        // TODO build dialog

        // Save flow amount
        // TODO after dialog has been build

        // Save the event and make it inactive
        const body = {
            eventID: props.activeEvent,
            saved: 1
        }
        makePutRequest('http://localhost:8080/api/events/save', body)
            .then(result => {
                // Delete the local storage saved data
                clearHistory();
                localStorage.removeItem('activeEvent');

                // Redirect to event selection screen
                navigate('/event')
            }).catch(err => console.log(err)
            )


    }

    return (

        <div className="selection-search-container">
            <BsSearch className='search-icon' />
            <TextField
                id="outlined-basic"
                label={t('search.box')}
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
                onClick={() => saveEvent()} >
                {t('search.event')}
            </Button>
        </div>

    )
}

export default SelectionSearchBar;