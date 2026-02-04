const fetch = require('cross-fetch');
const fs = require('fs');
require('dotenv-flow').config();
const serverName = process.env.RUNTIME_LITIUM_SERVER_URL;

const publicServer = serverName?.split('://');
if (publicServer?.length != 2) {
  throw (
    "'RUNTIME_LITIUM_SERVER_URL' need to be set to domain name including schema, example 'RUNTIME_LITIUM_SERVER_URL=https://litium.localtest.me:5001' in .env file, current value " +
    serverName +
    '.'
  );
}

var serverUrl = new URL('/storefront.graphql', serverName);
fetch(serverUrl.href, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    variables: {},
    query: `
      {
        __schema {
          types {
            kind
            name
            possibleTypes {
              name
            }
          }
        }
      }
    `,
  }),
})
  .then((result) => result.json())
  .then((result) => {
    const possibleTypes = {};

    result.data.__schema.types.forEach((supertype) => {
      if (supertype.possibleTypes) {
        possibleTypes[supertype.name] = supertype.possibleTypes
          .map((subtype) => subtype.name)
          .sort();
      }
    });

    const sortedPossibleTypes = sort(possibleTypes);
    fs.writeFile(
      './possibleTypes.json',
      JSON.stringify(sortedPossibleTypes, null, 2),
      (err) => {
        if (err) {
          console.error('Error writing possibleTypes.json', err);
        } else {
          console.log('Fragment types successfully extracted!');
        }
      }
    );
  });

/**
 * (javascript) returns the given object with keys sorted alphanumerically.
 * @param {T} obj the object to sort
 * @returns {T} the sorted object
 */
const sort = (obj) =>
  Object.keys(obj)
    .sort()
    .reduce((acc, c) => {
      acc[c] = obj[c];
      return acc;
    }, {});
