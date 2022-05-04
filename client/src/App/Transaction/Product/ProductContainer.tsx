import { useState, useEffect } from 'react';
import { Container } from 'react-bootstrap'
import makeGetRequest from '../../../utils/GetRequests';
import ProductButton from './ProductButton';

import './ProductContainer.scss';

/**
 * This component builds the central container for the transaction page
 * that holds all the products that can be selected. It filters the products
 * based on if the product is active and on the current selected category.
 * @param props Properties passed by the parent component.
 * @returns Renders the product container and all products.
 */
function ProductContainer(props: any) {

    const [errorProd, setErrorProd] = useState<any>(null);
    const [prodLoaded, setProdLoaded] = useState(false);
    const [products, setProducts] = useState<any[]>([])
    const [prod, setProd] = useState<any>({one:[], two:[], three:[], four:[]})
    
    /**
     * This use effect retrieves the products from the back-end.
     */
    useEffect(() => {
        if (prodLoaded) {
            return;
        }
        makeGetRequest("http://localhost:8080/api/products").then(result => {
            setProdLoaded(true);
            setProducts(result.products);
        }).catch(error => {
            setProdLoaded(true);
            setErrorProd(error);
        })
        
    }, [prodLoaded])

    /**
     * This use effect runs after the products were retrieved from the back-end. Having two
     * useEffects like this ensures that the products are filtered after the asynchronous 
     * fetch.
     * TODO investigate if this can be moved into the other useEffect method.
     */
    useEffect(() => {
        const newProd: { one: any[], two: any[], three: any[], four: any[] } = { one: [], two: [], three: [], four: [] };
        const activeProducts = products
        // Only show products that are in the current selected category.
        .filter(product => product.category.filter((category:any) => category.categoryID === props.activeCategory).length > 0)
        // Only show products that are not archived.
        .filter(product => product.archived !== 1)
        for (let i = 0; i < activeProducts.length; i++) {
            switch (i % 4) {
                case 0:
                    newProd.one.push(activeProducts[i])
                    break;
                case 1:
                    newProd.two.push(activeProducts[i])
                    break;
                case 2:
                    newProd.three.push(activeProducts[i])
                    break;
                case 3:
                    newProd.four.push(activeProducts[i])
                    break;
                default:
                    break;
            }
        }
        setProd(newProd)
    }, [products, props.activeCategory])
    if (errorProd) {
        return <div>Error: {errorProd.message}</div>;
    } else if (!prodLoaded) {
        return <div>Loading...</div>;
    } else {
        return (
            <Container>
                <div id='product-menu'>
                    <div key='left' id='inner'>
                        {prod.one.map((product:any) => (
                            <ProductButton key={product.id} product={product} addNewProductsHook={props.addNewProductsHook} selected={props.selected}/>
                        ))}
                    </div>
                    <div key='left-center' id='inner'>
                        {prod.two.map((product:any)  => (
                           <ProductButton key={product.id} product={product} addNewProductsHook={props.addNewProductsHook} selected={props.selected}/>
                        ))}
                    </div>
                    <div key='right-center' id='inner'>
                        {prod.three.map((product:any)  => (
                            <ProductButton key={product.id} product={product} addNewProductsHook={props.addNewProductsHook} selected={props.selected}/>
                        ))}
                    </div>
                    <div key='right' id='inner'>
                        {prod.four.map((product:any)  => (
                            <ProductButton key={product.id} product={product} addNewProductsHook={props.addNewProductsHook} selected={props.selected}/>
                        ))}
                    </div>

                </div>

            </Container>


        );
    }
}

export default ProductContainer;