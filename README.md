# AKA

The main repository for the Asterion Koningen Applicatie V3.0

## Description

The AKA is the Point of Sale (PoS) used by Stichting Societeit Asterion, currently it is using an antiquated system with a lot of flaws that cannot be repaired or maintained. The aim of this project is to offer a new replacement for the old AKA which can be easily maintained and expanded upon in the future. Currently this repository only contains the back-end and their API endpoints.

## Installation

To install the project, clone the repo and download all the needed node.js packages.

### Database

The project is compatible with MySQL, other compatibility will depend on the requirements of the Stichting Societeit Asterion.

To set up the database, run the SQL script. This script is not included in this repository and you need to contact the author to obtain this script.

Once the SQL script has set up the server, create a .env file in your project root folder with the options below.

```env
DATABASE_HOST={YOUR HOST NAME}
DATABASE_USER={USERNAME}
DATABASE_PASSWORD={PASSWORD}
DATABASE_SCHEMA={SCHEMA NAME}
```

Make sure that the .env file contains the correct credentials to access the database.

### Sessions

To be able to use the session for the API, add the following to your .env file:

```txt
SESSION_SECRET={YOUR SECRET}
```

### HTTPS

To setup HTTPS, you first have to generate a set of keys. This can be setup in various ways. Personally I have used [Certbot](https://certbot.eff.org/) to setup the signed keys for my website.

Once the keys are generated, move them to a .keys folder in the root folder of your repo.

Finally you have to setup the port, this can be done by adding ``PORT_HTTPS={PORT NUMBER}`` to your .env file.

### Google Sign-On

The API is compatible to be used by the Google Sign-On API. To use it you need to setup a project following the steps found on the [Google Dev website](https://developers.google.com/identity/sign-in/web/sign-in).

Once your project is set up, add the following to your .env file:

```txt
GOOGLE_CLIENT={YOUR GOOGLE CLIENT}
GOOGLE_SECRET={YOUR GOOGLE CLIENT SECRET}
```

## Running the API

To start the API, make sure all the steps in the installation have been completed.

Once you have done that, you can start the API with ``npm start`` in your terminal.

A full list of all paths and how to call them will be provided in a future version
