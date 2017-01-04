import { map, property } from 'lodash';

import fetch from 'isomorphic-fetch';

export default class {

 constructor(options) {
   this.options = options;
 }

  versionsOf(groupThenArtifact) {
    var parsedPackageCoordinates = /^([^:]+):([^:]+)$/.exec(groupThenArtifact);
    var [, mavenGroup, mavenArtifact] = parsedPackageCoordinates;

    const mavenSearchURL = encodeURI(`http://search.maven.org/solrsearch/select?q=g:"${mavenGroup}" AND a:"${mavenArtifact}"&core=gav&rows=20&wt=json`);

    return fetch(mavenSearchURL)
      .then(function(response) {
          if (response.status >= 400) {
              throw new Error("Bad response from server");
          }
          return response.json();
      })
      .then(function(versions) {
          return map(
            versions.response.docs,
            property('v')
          );
        });
  }


  checkFor(groupThenArtifact, atVersion) {
    var parsedPackageCoordinates = /^([^:]+):([^:]+)$/.exec(groupThenArtifact);
    var [, mavenGroup, mavenArtifact] = parsedPackageCoordinates;

    const mavenSearchURL = encodeURI(`http://search.maven.org/solrsearch/select?q=g:"${mavenGroup}" AND a:"${mavenArtifact}" AND v:"${atVersion}"&core=gav&rows=1&wt=json`);

    return fetch(mavenSearchURL)
      .then(function(response) {
          if (response.status >= 400) {
              throw new Error("Bad response from server");
          }
          return response.json();
      })
      .then(function(versions) {
          return (versions.response.docs.length != 0);
      });

  }
}
