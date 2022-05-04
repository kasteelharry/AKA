import CustomMUIButton from '../../../components/CustomMUIButton';


/**
 * This component renders the button with the product information. On click the product is added to the selected list.
 * @param props an object with the product, a method for on click and the currently selected products. Optional the key for this component.
 * @returns Renders a button for the passed product.
 */
function ProductButton(props:{product:any, addNewProductsHook:Function, selected:any[], key?:any}) {

    /**
     * Increases the amount of the product that was clicked and then adds it to the selected state.
     * @param addNewProductsHook Hook function passed by the parent component to set the selected state.
     * @param selected The state with the currently selected products.
     * @param product The selected product.
     */
    function addProduct(addNewProductsHook:Function, selected:any[], product:any) {
        product.timestamp = (new Date()).getTime();
        if (isNaN(product.amount)) {
            product.amount = 1
        } else {
            product.amount += 1;
        }
        if (!selected.includes(product)) {
            selected.push(product)
        }
        addNewProductsHook(selected);
    }


    let hotkey = '  (' + props.product.hotkey + ')'
    if (props.product.hotkey===undefined || props.product.hotkey === null) {
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
          }} className='product-button' clickHandler={() => addProduct(props.addNewProductsHook, props.selected, props.product)} text={props.product.name + hotkey}/>
    )
}

export default ProductButton;