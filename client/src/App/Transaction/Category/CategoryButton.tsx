import CustomMUIButton from '../../../components/CustomMUIButton';

/**
 * This component holds the customized button component that is used to display the various categories in the database.
 * @param props an object with the category, hotkey, an on click function and if applicable the key for the component.
 * @returns Renders the button that is used for the categories.
 */
function CategoryButton(props:{category:any, hotkey:string, onClick:Function, key?:any}) {
    const cat = props.category;
    let hotkey = '  (' + props.hotkey + ')'
    if (props.hotkey===undefined || props.hotkey === null) {
        hotkey = '';
    }
    return (
            <CustomMUIButton sx={{
                mt:2,
                fontSize:20,
                backgroundColor: 'primary.dark',
                '&:hover': {
                  backgroundColor: 'primary.main',
                  opacity: [0.9, 0.8, 0.7],
                },
              }} className={'button-category'} text={cat.Name + hotkey} size={'transaction'} variant={'primary'} clickHandler={() => props.onClick(cat.ID)}/>
    )
}

export default CategoryButton;