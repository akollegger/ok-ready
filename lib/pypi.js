import { keys, includes } from 'lodash';

import fetch from 'isomorphic-fetch';


export default class {

  constructor(options) {
    this.options = options;
  }

  versionsOf(pypiPackage) {

    const searchURL = encodeURI(`https://pypi.python.org/pypi/${pypiPackage}/json`);

    return fetch(searchURL)
      .then(function(response) {
          if (response.status >= 400) {
              throw new Error("Bad response from server");
          }
          return response.json();
      })
      .then(function(repositoryResult) {
        return keys(repositoryResult.releases)
      });
  }

  checkFor(packageName, atVersion) {
    return this.versionsOf(packageName)
      .then(function(registryResult) {
          return includes(registryResult, atVersion)
      });
  }

}
