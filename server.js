#!/usr/bin/env node

'use strict';

require('./processRequire.js');
const nopt = require('nopt');
const Server = process.require('lib/Server.js');
let database = process.require('lib/database.js');
let port;
let key;
let password;

// Process list of arguments
const knownProcessOptions = {
  port: [String, null],
  database: [String, null],
  key: [String, null],
  password: [String, null]
};

// Parse process arguments
const processOptions = nopt(knownProcessOptions, null, process.argv);

// Validate arguments
port = processOptions.port || 3004;
key = processOptions.key;
if (!key) throw new Error(`--key arg is missing`);
if (key.length < 16) throw new Error(`--key arg length must be 16 characters`);
console.log(`Key:\n\n${key}\n`);
password = processOptions.password;
if (!password) throw new Error(`--password arg is missing`);
console.log(`Password:\n\n${password}\n`);


// Load database
try {
  database.users = require(processOptions.database);
} catch (error) {
  throw new Error(`Invalid arguments: ${error.message}`);
}

const server = new Server(port, key, password);
server.start();
