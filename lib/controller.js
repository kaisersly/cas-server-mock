'use strict';

/**
 * Provides default route action to deal with CAS protocol.
 *
 * @class controller
 * @static
 */

const databaseProvider = process.require('lib/databaseProvider.js');
const { encrypt, decrypt } = process.require('lib/crypt.js');
const { URL } = require('url');

/**
 * Authenticates user.
 *
 * This is a mock, no verification is performed. The generated ticket is just the user login.
 *
 * @method authenticateAction
 * @static
 * @async
 * @param {Request} request ExpressJS HTTP Request
 * @param {Object} request.query Request query string
 * @param {String} request.query.service The service to redirect to when authenticated
 * @param {String} request.query.login The user login to authenticate
 * @param {Response} response ExpressJS HTTP Response
 * @param {Function} next Function to defer execution to the next registered middleware
 */
module.exports.authenticateAction = (request, response, next) => {
  let password = request.app.get('password');
  console.log(`Username renseigné: ${request.query.login}`);
  console.log(`Password renseigné: ${request.query.password}`);
  console.log(`Password attendu: ${password}`);
  if (request.query.password !== password) {
    response.statusCode = 302;
    let url = new URL(request.protocol + '://' + request.get('host') + request.originalUrl);
    url.searchParams.delete('password');
    response.setHeader('Location', url.toString().replace('/authenticate', '/login'));
    response.setHeader('Content-Length', '0');
    response.end();
    return;
  }
  let redirectUrl = new URL(request.query.service);
  let key = request.app.get('key');
  let ticket = encrypt(request.query.login, key);
  redirectUrl.searchParams.append('ticket', ticket);
  console.log(`URL: ${redirectUrl}`);

  response.statusCode = 302;
  response.setHeader('Location', redirectUrl.href);
  response.setHeader('Content-Length', '0');
  response.end();
};

/**
 * Validates ticket.
 *
 * This is a mock, no verification is performed. The generated ticket is just the user login.
 * User is retrieved from the database file and all its attributes are sent.
 * No verification is performed, it always sends an authentication success.
 *
 * @method validateTicketAction
 * @static
 * @async
 * @param {Request} request ExpressJS HTTP Request
 * @param {Object} request.query Request query string
 * @param {String} request.query.ticket The ticket (user login)
 * @param {Response} response ExpressJS HTTP Response
 * @param {Function} next Function to defer execution to the next registered middleware
 */

function xmlResponse(user) {
  if (!user) {
    return `
      <cas:serviceResponse xmlns:cas='http://www.yale.edu/tp/cas'>
          <cas:authenticationFailure code="INVALID_TICKET">
            ticket not recognized
          </cas:authenticationFailure>
      </cas:serviceResponse>
    `;
  }
  let result = `
    <cas:serviceResponse xmlns:cas='http://www.yale.edu/tp/cas'>
        <cas:authenticationSuccess>
            <cas:user>${user.name}</cas:user>
            <cas:attributes>
  `;

  for (let attributeName in user.attributes) {
    const attributeValue = user.attributes[attributeName];
    if (Object.prototype.toString.call(attributeValue) === '[object String]') {
      result += `<cas:${attributeName}>${attributeValue}</cas:${attributeName}>`;
    } else if (Object.prototype.toString.call(attributeValue) === '[object Array]') {
      attributeValue.forEach((value) => {
        result += `<cas:${attributeName}>${value}</cas:${attributeName}>`;
      });
    }
  }

  result += `
            </cas:attributes>
        </cas:authenticationSuccess>
    </cas:serviceResponse>
  `;
  return result;
}

function jsonResponse(user) {
  let result;
  if (!user) {
    result = {
      serviceResponse: {
        authenticationFailure: {
          code: "INVALID_TICKET",
          description: "Ticket not recognized"
        }
      }
    }
  } else {
    result = {
      serviceResponse: {
        authenticationSuccess: {
          user: user.name,
          attributes: user.attributes
        }
      }
    };
  }
  return JSON.stringify(result);
}

module.exports.validateTicketAction = (request, response, next) => {
  let key = request.app.get('key');
  let user;
  try {
    let username = decrypt(request.query.ticket, key);
    user = databaseProvider.getUser(username);
  } catch (error) {
  }
  let result;
  console.log(request.query);
  if ('format' in request.query && request.query.format === 'JSON') {
    result = jsonResponse(user);
  } else {
    result = xmlResponse(user);
  }

  response.send(result);
};

/**
 * Logouts user.
 *
 * This is a mock, no verification is performed, nothing is done. User is just redirected to the given URL.
 *
 * @method logoutAction
 * @static
 * @async
 * @param {Request} request ExpressJS HTTP Request
 * @param {Object} request.query Request query string
 * @param {String} request.query.url The URL to redirect to
 * @param {Response} response ExpressJS HTTP Response
 * @param {Function} next Function to defer execution to the next registered middleware
 */
module.exports.logoutAction = (request, response, next) => {
  response.statusCode = 302;
  response.setHeader('Location', request.query.url);
  response.setHeader('Content-Length', '0');
  response.end();
};
