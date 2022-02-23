import React from 'react'
import { cls } from '../utils/utils';

type ButtonProps = {
    disabled: boolean,
    type: 'button' | 'submit' | 'reset' | undefined,
    className: string,
    size: 'small' | 'normal' | 'large',
    variant: 'primary' | 'secondary',
    text: string
}

const classes = {
    base: 'font-medium justify-center',
    disabled: 'opacity-50 cursor-not-allowed',
    round: 'rounded-lg',
    size: {
        small: 'px-2 py-1 text-sm',
        normal: 'px-3 py-2',
        large: 'px-8 py-3 text-lg'
    },
    variant: {
        primary: 'text-white bg-gradient-to-r from-aegee-300 via-aegee-400 to-aegee-500 hover:bg-gradient-to-br focus:ring-2 focus:ring-orange-300 dark:focus:ring-orange-800',
        secondary: 'text-aegee-500 hover:text-white border border-aegee-400 hover:bg-gradient-to-tr hover:from-aegee-300 hover:via-aegee-400 hover:to-aegee-500 focus:ring-2 focus:ring-aegee-300 dark:border-aegee-500 dark:text-aegee-500 dark:hover:text-white dark:hover:bg-aegee-600 dark:focus:ring-aegee-800'
    }
}

function Button({disabled=false, type='button', size='normal', variant='primary', className, text}: ButtonProps) {
    return (
        <button
            disabled={disabled}
            type={type}
            className={cls(`
                ${classes.base}
                ${classes.round}
                ${classes.size[size]}
                ${classes.variant[variant]}
                ${disabled && classes.disabled}
                ${className}
            `)}
        >

            {text}
        </button>
    );
}


export default Button