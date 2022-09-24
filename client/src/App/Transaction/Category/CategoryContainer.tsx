import { Box } from '@mui/material';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import CustomMUIButton from '../../../components/CustomMUIButton';
import makeGetRequest from '../../../utils/GetRequests';
import CategoryButton from './CategoryButton';

import './CategoryContainer.scss';

/**
 * This component holds the container and subcomponent that make show the different categories.
 * @param props Properties passed by the paren component.
 * @returns Renders the container on the transaction page that holds all the categories.
 */
function CategoryContainer(props: any) {

    const { t } = useTranslation();
    const navigate = useNavigate();

    const [errorCategory, setErrorCategory] = useState<any>(null);
    const [catLoaded, setCatLoaded] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);

    useEffect(() => {
        if (catLoaded) {
            return;
        }
        makeGetRequest('/api/category')
        .then(res => {
            setCategories(res.categories);
            setCatLoaded(true);
        })
        .catch(err => setErrorCategory(err));
    }, [catLoaded]);
    
    if (errorCategory) {
        return <div>Error: {errorCategory.message}</div>;
    } else if (!catLoaded) {
        return <div>Loading...</div>;
    } else {
        return (
            <div>
                <Box className='category-menu'>
                    {categories.map(category => (
                        <CategoryButton key={category.Name} category={category} hotkey={category.hotkey} onClick={() => props.setActiveCategory(category.ID)} />
                    ))}
                </Box>
                <Box className='cancel-button-box'>
                <CustomMUIButton className={'button-cancel'} text={t('transaction.cancel')} clickHandler={() => navigate('../selection')}
        sx={{
            fontSize:20,
            backgroundColor: 'primary.dark',
            '&:hover': {
              backgroundColor: 'primary.main',
              opacity: [0.9, 0.8, 0.7],
            },
          }} />
                </Box>
            </div>
                
        )
    }
}

export default CategoryContainer;