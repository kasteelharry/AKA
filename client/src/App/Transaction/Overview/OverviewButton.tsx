import CustomMUIButton from '../../../components/CustomMUIButton';


/**
 * This component renders a button for every selected product. If the product was selected multiple times, it also keeps track of the amount.
 * By clicking the button the amount is lowered by one.
 * TODO add shift click deletes te entire product.
 * @param props props passed by the paren component. Contains the product, the already selected products and an on change function.
 * @returns Renders a button with the product that was selected.
 */
function OverviewButton(props: { product: any, onChange: Function, selected: any[], key?: any }) {

    /**
     * When called, this method removes either one of the amount for the selected product or it removes it from the selected list if the amount becomes zero.
     * @param onChange a function that is passed by the function or component calling the function.
     * @param selected The list with all the selected products for a customer.
     * @param product The product that is modified.
     */
    function removeProduct(onChange: Function, selected: any[], product: any) {
        const index = selected.indexOf(product);
            if (selected[index].amount > 1) {
                selected[index].amount -= 1
            } else if (index > -1 && selected[index].amount <= 1) {
                selected[index].amount = 0
                selected.splice(index, 1)
                
            }

        onChange(selected);
    
    }

    return (
        <CustomMUIButton className={'button-category'} text={props.product.amount + 'x ' + props.product.name} clickHandler={() => removeProduct(props.onChange, props.selected, props.product)}
        sx={{
            fontSize:20,
            backgroundColor: 'primary.dark',
            '&:hover': {
              backgroundColor: 'primary.main',
              opacity: [0.9, 0.8, 0.7],
            },
          }}
        />
    )
}

export default OverviewButton;
