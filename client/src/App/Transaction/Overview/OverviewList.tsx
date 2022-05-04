import { useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';
import OverviewButton from './OverviewButton';
import Box from '@mui/material/Box';

/**
 * The list component that has buttons based on the selected products.
 * @param props props passed by the parent component.
 * @returns Renders a container with buttons that resemble the selected products.
 */
function OverviewList(props: any) {

    const [shadowSelected, setShadowSelected] = useState<any[]>([]);

    useEffect(() => {
        setShadowSelected(props.selected)
    }, [props.selected])

    return (
        <Container className='overview-list'>
            {shadowSelected.map((product: any) => (
                <Box mt={1} display="flex" justifyContent="space-between" key={product.id} id='selected-products'
                >
                    <OverviewButton key={product.id + product.name} product={product} onChange={props.addNewProductsHook} selected={props.selected} />
                </Box>
            ))}

        </Container>
    )
}

export default OverviewList;