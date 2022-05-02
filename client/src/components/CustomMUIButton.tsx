import Button from '@mui/material/Button';

/**
 * A custom Materials UI button with some set parameters.
 * @param props props passed by the parent component.
 * @returns renders a button with set values and type.
 */
function CustomMUIButton(props:any) {

    let clickFn:Function = function() {
        console.log("no function");
    }
    if (props.clickHandler !== undefined) {
        clickFn = props.clickHandler
    }


    return (
        <Button sx={props.sx} className={props.className} size='large' variant="contained" onClick={() => clickFn()}>
            {props.text}
      </Button>
    )

}


export default CustomMUIButton;