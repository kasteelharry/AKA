import React from 'react'
import { Nav, NavDropdown } from 'react-bootstrap'
import { MdPublic } from "react-icons/md"
import { IconContext } from 'react-icons'

import LanguageSelections from './LanguageSelections'

const languages = [
    {
        code: 'en',
        country_code: 'US'
    },
    {
        code: 'nl',
        country_code: 'NL'
    }
]

function LanguageSelector() {
    const icon = (<IconContext.Provider value={{ size:'2em', style: {verticalAlign: 'top'} }}>
            <MdPublic />
    </IconContext.Provider>);

    return (
        <Nav className="ml-auto">
            <NavDropdown
                align="end"
                title={icon}
                id="language-dropdown">
                {languages.map(({ code, country_code }) => (
                    <LanguageSelections key={code} code={code} country_code={country_code} />
                ))}
            </NavDropdown>
        </Nav>
    )
}

export default LanguageSelector
