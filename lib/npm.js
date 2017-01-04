import { map, property, includes } from 'lodash';

import fetch from 'isomorphic-fetch';

export default class {

  constructor(options) {
    this.options = options;
  }

  versionsOf(npmPackage) {

    const npmSearchURL = encodeURI(`https://registry.npmjs.org/${npmPackage}`);

    return fetch(npmSearchURL)
      .then(function(response) {
          if (response.status >= 400) {
              return { versions: [] };
          }
          return response.json();
      })
      .then(function(registryResult) {
          return (map(
            registryResult.versions,
            property('version')
          ));
      });
  }

  checkFor(packageName, atVersion) {
    return this.versionsOf(packageName)
      .then(function(registryResult) {
          return includes(registryResult, atVersion)
      });
  }

}
