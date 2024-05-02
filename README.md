# This fork

This fork adds two new security arguments:
- --key: set a 16 characters key that is used to encrypt/decrypt the token
- --password: set a password that will be required for authentication

Also, if the password is valid and the user doesn't appear in the database, a user with no attributes is returned.

# Apereo CAS simple server mock

Really simple basic mock for [Apereo CAS server](https://www.apereo.org/projects/cas). This should not be used in production environment, it is just for test purpose, nothing more.

# Install

    npm install cas-server-mock

# Usage

Start a fake CAS server with the following command:

    npx cas-server-mock --port=3004 --database=/tmp/users.json --password tryme --key 123456abcdef78gh

With:

- --port option The HTTP port the server will listen to (default to 3004)
- --database The path to the JSON file containing the database of users (see below)
- --password A password required for authentication
- --key A key that will crypt the token

**Nb:** If process is launched as a sub process it will send a message to its parent process when starting:

```js
{status: 'started'}
```

## CAS users

The database user must be a simple JSON file containing an array of users. Each user must have a *name* property used to authenticate the user and a *attributes* property with as many properties as you want. Attributes values must be either Strings or Arrays.

```js
[
  {
    "name": "user-id", // The id of the user to log with
    "attributes": { // User attributes
      "stringAttribute": "value",
      "arrayAttribute": ["arrayValue"],
      [...]
    }
  }
]
```

# Contributors

Maintainer: [Veo-Labs](http://www.veo-labs.com/)

# License

[AGPL](http://www.gnu.org/licenses/agpl-3.0.en.html)
