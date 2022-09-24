import { Alert, AlertTitle, Dialog } from "@mui/material";
import { useState } from "react";

/**
 * This component contains the alert that is used to inform the user that the
 * transaction does not longer exists or could not be found in the back-end database.
 * @param props Properties passed by the parent component.
 * @returns Renders the alert
 */
export default function CustomAlert(props:any) {
    const [open, setOpen] = useState(true);

    const handleClick = () => {
        setOpen(!open);
        props.setError(false);
    };

    return (
            <Dialog open={open} onClose={handleClick}>
                <Alert severity="error">
                    <AlertTitle>Error</AlertTitle>
                    This transaction was deleted or not found — <strong>Contact your system administrator</strong>
                </Alert>
            </Dialog>
    );
}