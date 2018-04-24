# XYZ

A Node.js framework to develop applications and APIs for spatial data.

tl;dr Here is a hosted version of the XYZ without login:
[https://geolytix.xyz/open](https://geolytix.xyz/open)

## Introduction

The XYZ framework is designed around the idea to serve spatial data from PostGIS datasources without the need of additional services running elsewhere. The framework is modular with dependencies on third party open source modules such as the open GIS engine [Turf](https://github.com/Turfjs/turf), the authentication middleware [Passport](https://github.com/jaredhanson/passport), the [Leaflet](https://github.com/Leaflet/Leaflet) javascript engine for interactive maps and [Google Puppeteer](https://github.com/GoogleChrome/puppeteer) to create server-side PDF reports.

## Licence

Free use of the code in this repository is allowed through a [MIT licence](https://github.com/GEOLYTIX/xyz/blob/master/LICENSE).

## Dependencies

We are currently using Node.js version 8.5 in production.

Style sheets for the browser interface are written in SASS/SCSS. We include the compiled css in the repository. With SASS installed it is possible to compile all style sheets with following command `sass -update public/css` from the application root.

The application is compiled with Webpack (v3) and Babel.

The [xyz entry code](https://github.com/GEOLYTIX/xyz/blob/dev/public/js/xyz_entry.js) can be compiled with the `npm run build` command from the root.

### Puppeteer

[Google Puppeteer](https://github.com/GoogleChrome/puppeteer) is used to generate PDF reports server-side. In it's current state the project install of Pupetteer takes 300mb out of a total 400mb worth of dependencies. It is recommended to install Puppeteer either global `sudo npm install puppeteer --global --unsafe-perm` and then set a link to the global install in the project folder `npm link puppeteer`. Otherwise Puppeteer can be installed local with `npm install puppeteer`.

## Environment Settings

The environment settings contain sensitive information such as data source connection strings, security information and API keys. These should never be made public and are not contained in this repository.

Running the application without any environment settings will host a sample application with a single OSM base layer on port 3000.

In Visual Studio Code we recommend to store the environment settings in the env:{} object of the .launch file.

During startup, server.js will check for [dotenv](https://www.npmjs.com/package/dotenv). If found the dotenv settings will be loaded as environment settings.

We use the [PM2](https://github.com/Unitech/pm2) process manager in our production environment to run multiple instances of the framework on different ports on the same server. With PM2 we store the settings in a json document which is used to start the application using the command: `pm2 start myapplication.json`

`"PORT": "3000"`
The port on which the application is run.

`"HOST": "geolytix.xyz"`
The host is required in order to send verification or media links.

`"LOCALHOST": "http://localhost:3000"`
The localhost is required for server side reporting.

`"DIR": "/xyz"`
The name of the application root directory. This is required by the Express router to set the public directory.

`"APPSETTINGS": "demo.json"`
The name of the *appsettings* file ([in the settings directory](https://github.com/GEOLYTIX/xyz/tree/master/settings)) which holds the settings for the application and/or services which are hosted in this instance of the framework. The *appsettings* will be discussed in detail in the next section of this documentation.

`"LOGIN": "mongodb://localhost:27017/xyz"`
(optional) The location of a Mongo database in which the user accounts are stored for applications and services which require passport authentication. No login is used if this param is not set.

`"TRANSPORT": "smtps://geolytix%40gmail.com:password@smtp.gmail.com"`
(optional) An SMTP connection string which is required for the application to send emails. The passport security module uses this mail account to send verification requests to new registrants.

`"OURSECRET": "ChinaCatSunflower"`
(optional) A session secret which is required to compute the session hash.

```
"DBS_XYZ": "postgres://username:password@123.123.123.123:5432/database"
"DBS_MVT": "postgres://username:password@123.123.123.123:5432/database"
```
Keys beginning with DBS_ store PostGIS data source connections. During startup the keys are read and stored in the global.DBS object. The remainder of the DBS_*** string is the key for the connection object. This key can be referenced as the  dbs parameter in XHR requests sent from the client. This allows different services and layers to connect to different data sources in the same hosted API. Any dbs keys defined in the application settings object (\_XYZ) must be referenced with a matching DBS_* key and connection string. E.g. A layer with dbs:XYZ requires DBS_XYZ with a valid connection string in the environment settings. Please reference [pg-connection-string] which is used by node-postgres to connect to a data source from a connection string.

Similar to the DBS connection strings the API keys which are defined in the environment settings are stored in the global.KEYS object. The remainder of the KEY_*** string is the key for the request object. The key is provided as *provider* parameter in XHR requests from the client.

`"KEY_GOOGLE": "key=***"`
A Google Maps API key which is required if Google Maps Services such as Distance Matrices or Geocoding are referenced by the XYZ api.

`"KEY_MAPBOX": "access_token=pk.***"`
A Mapbox API key which is required if Mapbox base maps and/or Mapbox services such as Distance Matrices or Geocoding are referenced by the XYZ api.

`"KEY_HERE": "app_id=***&app_code=***"`
A HERE API key which is required if HERE base maps are used.

`"IMAGES": "cloudinary api_key api_secret cloud_name folder",`
We use (cloudinary)[https://cloudinary.com] to store images uploaded from the browser application interface. 

## Application Settings

Application settings are stored in the [/settings](https://github.com/GEOLYTIX/xyz/tree/dev/settings) directory. Application settings control instance specific settings for layers, styles, locales and which modules should be loaded by client applications. Below is a list of settings which are currently supported by the framework. Default minimum viable settings will be set if *appsettings* are not defined in the environment settings or if the settings cannot be opened by the node process.

`"title": "XYZ Demo"`
(optional) The application title which will be inserted into the title meta tag in the HTML template.

`"gazetteer": {}`
(optional) Whether the gazetteer module should be enabled. Without the gazetteer module you will not be able to switch between locales

`"select": {}`
(optional) Whether the selection module should be enabled. Without the selection module you will not be able to select features and query their properties.

`"locate": true,`
(optional) Whether the geolocator should be enabled. *Note that the geolocator requires a secure connection via https.*

`"documentation": "documentation"`
(optional) Whether a documentation button should be enabled. If set to 'documentation' the [documentation.md](https://github.com/GEOLYTIX/xyz/tree/dev/public/documentation.md) markhub will be displayed in a github flavoured view. Any suitable link can be set instead of 'documentation'.

`"locale": "UK"`
(optional) The default locale which is opened and set to the url hook parameter when an application is accessed. Defaults to the first locale in the locales object.

`"locales": {}`

### Locales

Locales are regional sub settings. Each locale is defined by it's name, bounds and a set of layers. A locale can be selected from the dropdown next to the input field in the gazetteer module. The dropdown will only be active if more than one locale object is defined in the *appsettings*. The locale 'Global' will be represented as a globe icon.

The current local is defined as url_hook. For example [https://geolytix.xyz/open/?locale=Global](https://geolytix.xyz/open/?locale=Global) will open the Global locale from the settings for the /open instance.

Each locale is a set of objects which are described here:

`"name": "Europe"`
(optional) The display name for the locale. The locale key will be used if not set.

`"bounds": [[25,-45],[75,60]],`
(optional) An array of \[lat,lon\] coordinate pairs which define the bounds of a locale. It will not be possible to pan the map outside the bounds. The default bounds are \[\[-90,-180\],\[90,180\]\].

```
"minZoom": 5,
"maxZoom": 9
```
(optional) The min and max zoom for the leaflet map object. The defaults range is zoom 0 to 20 if not set.

`"gazetteer": ["MAPBOX", "", "'-45,25,60,75'", "e.g. Brussels"]`
The gazetteer to be used for the locale. The first entry in the array is the provider (MAPBOX or GOOGLE). A corresponding KEY_*** is required in the environment settings in order to use a 3rd party service. TO BE COMPLETED AFTER DATABASE GAZETTEER IMPLEMENTATION.

`"layers": {}`

### Layers

Layers are a sub setting of a locale. Each layers object has a set of parameters which depend on the type of layer, whether the layer is interactive or editable and how the data should be styled in the map window.

Types of layers which are currently supported:

grid
cluster
mvt
base


## Server

[server.js](https://github.com/GEOLYTIX/xyz/blob/master/server.js) starts an [Express](https://expressjs.com/) server on the specified port, sets the public directory, favicon and passport security from the environment settings. *Clustering is still very much in development and not fully supported yet.*

## Middleware

[router.js](https://github.com/GEOLYTIX/xyz/blob/master/router.js) is the middlewares main entry point.

## Security

Access to any method or data source served through the XYZ framework can be restricted through the authentication middleware [Passport](http://www.passportjs.org/). The [passport-local](https://github.com/jaredhanson/passport-local) strategy in combination with cookie sessions is used as default authentication method. *The implementation of JSON Web Tokens is planned for a future feature release.*  

The default strategy uses a local MongoDB database in which users account are registered. XYZ endpoints allow for accounts to be created, removed, authenticated, approved and authorized.  

User accounts consist of an email address and password only. It is possible to create user accounts which are not email addresses. These accounts must be authenticated by an administrator or directly in the database.  

**Authentication** is the process of ascertaining that somebody really is who he claims to be. Once a user creates a new account an automated email will be sent from the passport module to the email address provided by the user. This email contains a link which is valid for 1 hour. Users authenticate accounts by following the link and thus proving that they have access to the email account which has been provided in the registration request.

Account **approval** is an administrative process. Adminstrator accounts can send requests to the passport middleware that they recognise the email address of an account and approve access for the account.

A new database will be created when the first user account is registered. In order to approve this user and give administrative rights to the account open a mongo console to use the database and manually update the account like so:
```
db.users.update({"email":"dennis.bauszus@geolytix.co.uk"},{$set:{"verified":true, "approved":true, "admin":true}})
```
