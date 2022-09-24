import { useTranslation } from 'react-i18next'
import React from 'react'
import { NavDropdown } from 'react-bootstrap'
import ReactCountryFlag from 'react-country-flag'
import PropTypes from 'prop-types'
import i18n from '../../i18n'

function isActive(lang: string, country: string): boolean {
    return i18n.language === (lang + '-' + country) || i18n.language === lang;
}

function setActive(lang: string): void {
    i18n.changeLanguage(lang)
    return;
}

function LanguageSelections({ code, country_code }: { code: string, country_code: string }) {
    const { t } = useTranslation();

    return (
        <NavDropdown.Item
            as="button"
            className={isActive(code, country_code) ? "active" : ""}
            onClick={() => setActive(code)}
        >
            <ReactCountryFlag
                countryCode={country_code}
                svg
                title={country_code}
            /> {t('menu.language.' + code)}
        </NavDropdown.Item>
    )
}

LanguageSelections.propTypes = {
    country_code: PropTypes.string,
    code: PropTypes.string
}

export default LanguageSelections
