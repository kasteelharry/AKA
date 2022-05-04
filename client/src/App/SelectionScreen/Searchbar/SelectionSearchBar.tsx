import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {BsSearch} from 'react-icons/bs';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';


import './SelectionSearchBar.scss';


/**
 * This component contains the search bar, the input field and the show history button.
 * @param props Properties passed by the parent component.
 * @returns Renders the search bar.
 */
function SelectionSearchBar(props: any) {
    const { t } = useTranslation();
      // textInput must be declared here so the ref can refer to it
  const textInput = useRef<HTMLInputElement>(null);

  /**
   * Ensures that the focus is returned to the input field.
   */
  function clickHandler() {
      if (textInput.current !== null) {
          textInput.current.focus();
      }
    props.setHistory(!props.history)
  }

    return (
        
        <div className="selection-search-container">
            <BsSearch className='search-icon'/>
            <TextField id="outlined-basic" label={t('search.box')} variant="outlined" onChange={event => props.setQuery(event.target.value)} autoComplete='off' inputRef={textInput}className='search-input' autoFocus={true} placeholder={t('search.box')} />
            <Button color='primary' variant="contained" disabled={false} type={'button'} className='showHistory' onClick={() => clickHandler()} >
                {t('search.history')}</Button>
        </div>
        
    )
}

export default SelectionSearchBar;