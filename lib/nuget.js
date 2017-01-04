
import { map, property, includes } from 'lodash';

import fetch from 'isomorphic-fetch';

export default class {

  constructor (options) {
    this.options = options;
  }

  versionsOf(nugetPackageName) {

    const nugetSearchURL = encodeURI(`https://api-v2v3search-0.nuget.org/query?q=packageid:${nugetPackageName}&prerelease=true`);

    return fetch(nugetSearchURL)
      .then(function(response) {
          if (response.status >= 400) {
              throw new Error("Bad response from server");
          }
          return response.json();
      })
      .then(function(registryResult) {
          return (registryResult.totalHits > 0) ?
            (map(
              registryResult.data[0].versions,
              property('version')
            ))
            :
            [];
      });

  }


  checkFor(packageName, atVersion) {
    return this.versionsOf(packageName)
      .then(function(registryResult) {
          return includes(registryResult, atVersion)
      });
  }
}
