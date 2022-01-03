# AKA front-end

The front end of this application is written in React. Please familiarize yourself with [the React docs](https://reactjs.org/) and [the React Bootstrap docs](https://react-bootstrap.github.io/) before contributing.

## i18n

This front-end utilizes the i18next library for React, which allows easy internationalization. Although React makes use of near-like HTML elements (JSX), we don't want to write plain text in these elements ourselves. We actually want to add 'keys' where we want text, then we can put translations for these keys in public/assets/locales.

### Writing content on a page

When we want to add text to a page, we use a 'key'. We wrap a key name in a `t()` function inside JSX, so that i18next can replace the key with the translation. Let's look at an example:

```JSX
<Container>
    <h1>This is a title!</h1>
    <p>This is a paragraph!</p>
</Container>
```

In this example, we have a container with a title and some text in it. In order to make this i18next-*proof*, we replace the text with a `t()` function:

```JSX
<Container>
    <h1>{t('title_key')}</h1>
    <p>{t('par1_key')}</p>
</Container>
```

Now i18next will display only the name of the key inside the browser. To add a translation to this key, we must add a value to this key. This is shown in the next section.

For more advanced usage of i18next, please see [react.i18next.com](https://react.i18next.com/).


### Adding translations

Well then! You think you have it in you to add translations for this beautiful site? **Sehr schön!**

Inside the folder public/assets/locales/ you can add a file for a language. The name of the file must follow the [ISO 639-1 standard](https://nl.wikipedia.org/wiki/Lijst_van_ISO_639-codes) (the two-letter code of a language). These files are JSON key-value pairs.

The contents of these files might look like this:

*en.json*
```JSON
{
    "key_name": "value",
    "keys_inside_keys": {
        "more_keys": "value"
    },
    "key_reusing": "Here we reuse a $('key_name')"
}
```

Where the keys respond to the location inside the code and the values are the corresponding translations. Structure can be brought into the file by chaining keys. The key for the translation can be accessed by calling the following key in the `t()` function: `t('keys_inside_keys.more_keys')`.

Because it can be a hassle to translate everything inside this big project, we use a Visual Studio Code add-on called [i18n Ally](https://marketplace.visualstudio.com/items?itemName=lokalise.i18n-ally). This tool will keep track of translations and keys and allow you to easily add translations without even leaving the React code. Add the following to your *.vscode/settings.json*:

```JSON
{
    //...
    "i18n-ally.localesPaths": [
        "client/public/assets/locales"
    ]
    //...
}
```


Please see [the wiki](https://github.com/lokalise/i18n-ally/wiki) for this add-on to see how to configure and use it.