import { Box, Button, FormControl, FormControlLabel, FormLabel, InputAdornment, Radio, RadioGroup, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import makeGetRequest from "../../utils/GetRequests";
import makePostRequest from "../../utils/PostRequests";


import './EventScreen.scss';
import EventSelectionModal from "./EventSelectionModal";

/**
 * This component contains the event creation page. As of right now, it
 * is a separate page. A future version might move this into a modal.
 * @param props Properties passed by the router.
 * @returns Renders the event creation page.
 */
function EventScreen(props: any) {

    const navigate = useNavigate();
    const { t } = useTranslation();

    const [requestLoaded, setLoaded] = useState<boolean>(false);
    const [eventName, setEventName] = useState<string>();
    const [flowMeter, setFlowMeter] = useState<number>(0);
    const [eventType, setEventType] = useState<any[]>([]);
    const [selectedEventType, setSelectedEventType] = useState<string>();
    const [manyActiveEvents, setManyEvents] = useState(false);
    const [activeEvents, setActiveEvents] = useState<any[]>([]);




    useEffect(() => {
        if (!requestLoaded) {
            setLoaded(true);
            makeGetRequest('/api/events/active').then(result => {
                if (result.events !== undefined && result.events.length > 0) {
                    console.log(result.events);
                    
                    setManyEvents(true);
                    setActiveEvents(result.events)
                    return;
                }
            });
            makeGetRequest('/api/eventtypes').then(result => {
                setEventType(result.eventTypes);
            })
        }

    }, [requestLoaded])

    if (props.activeEvent > -1) {
        // navigate('/selection')
    }

    function submitEvent() {
        const body = {
            name: eventName,
            eventID: selectedEventType,
            startTime: undefined,
        }
        makePostRequest('/api/events', body).then(result => {
            console.log(result.event);
            
            props.setActiveEvent(parseInt(result.event));
            localStorage.setItem('activeEvent', result.event);
            localStorage.setItem('flowStand', flowMeter.toString());

        //TODO put in an error handler. 
        }).catch(err => console.log(err)
        );
        navigate('/selection')
    }

    return (
        <Box className="Event-Container">
            <Typography variant="h3" component='div' gutterBottom>
                {t("event.title")}
            </Typography>
            <div>

            </div>
            <Box component="form" onSubmit={(e: any) => {
                e.preventDefault()
                submitEvent();
                

            }} className="Event-Creation">
                <div className="Event-Input-Name">
                <TextField
                    className='Event-Input-Name'
                    required
                    InputProps={{ style: { fontSize: 25 } }}
                    InputLabelProps={{ style: { fontSize: 25 } }}
                    onChange={e => setEventName(e.target.value)}
                    label={t("event.name")}
                    variant='filled'></TextField>
                </div>
                <div className="Event-Input-Flow">

                <TextField
                className='Event-Input-Flow'
                InputProps={{ style: { fontSize: 25 } }}
                    InputLabelProps={{ style: { fontSize: 25 } }}
                required
                    onChange={e => {

                        const newAmount = (+e.target.value).toFixed(1);
                        const rounded = parseInt((parseFloat(newAmount) * 10).toFixed(1));
                        
                        setFlowMeter(rounded);
                    }}
                    label={t("event.flow")}
                    type='number'
                    inputProps={{
                        step: "0.1",
                        startadornment: <InputAdornment position="start">Litres</InputAdornment>,
                    }}
                    variant='filled'></TextField>
                    </div>
                    <div className="Event-Input-Type">

                <FormControl required>
                    <FormLabel sx={{fontSize:25}} id="radio-buttons-events">{t("event.select")}</FormLabel>
                    <RadioGroup
                    className="Event-Input-Type"
                    aria-labelledby="demo-radio-buttons-group-label"
                    name="radio-buttons-group"
                        onChange={e => setSelectedEventType((e.target as HTMLInputElement).value)}
                        >
                        {eventType.map((type) => (
                            <FormControlLabel key={type.ID} value={type.ID} control={
                                <Radio 
                                sx={{
                                    '& .MuiSvgIcon-root': {
                                      fontSize: 35,
                                    },
                                  }}
                                required
                                />
                            } label={<Typography fontSize={25} className='formControlLabel'>{type.Name}</Typography>} />
                            ))}
                    </RadioGroup>
                </FormControl>
                            </div>
                <Button sx={{fontSize:20}}
                className='Event-Input-Button' 
                type='submit' 
                variant="contained">
                    {t("event.button")}
                    </Button>
            </Box>
            {manyActiveEvents && <EventSelectionModal events={activeEvents} setActiveEvent={props.setActiveEvent} />}
        </Box>
        
    );
}

export default EventScreen;