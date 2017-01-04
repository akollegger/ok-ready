import ApolloClient, { createNetworkInterface } from 'apollo-client'
import gql from 'graphql-tag';
import { map, property, has, isNull, includes } from 'lodash';

require('isomorphic-fetch');

var client = null;

export default class {

  constructor(options) {
    client = new ApolloClient({
      networkInterface: createNetworkInterface(
        {
          uri: 'https://api.github.com/graphql',
          opts: {
            // Additional fetch options like `credentials` or `headers`
            // credentials: 'same-origin',
            headers: {
              'Authorization': `Bearer ${options.token}`
            },
          }
        }
      )
    });
  }


  versionsOf(repositoryOwnerName) {

    var parsedRepository = /^([^\/]+)\/([^\/]+)$/.exec(repositoryOwnerName);
    var [, githubOwner, githubRepository] = parsedRepository;

    const githubReleasesQuery = gql`
      {
        repository(owner:"${githubOwner}", name: "${githubRepository}") {
          releases(last:3) {
            edges {
              node {
                tag {
                  name
                }
              }
            }
          }
        }
      }
    `
    return client.query({
      query: githubReleasesQuery
    }).then((graphQLResult) => {
      const { errors, data } = graphQLResult;

      if (errors) {
        throw new Error(errors);
      }
      else if (data && has(data, 'repository.releases.edges')) {
        return map(
          data.repository.releases.edges,
          property('node.tag.name')
        );
      } else {
        if (isNull(data.repository)) {
          throw new Error("Repository not found.");
        }
      }
    });
  }


  checkFor(packageName, atVersion) {
    return this.versionsOf(packageName)
      .then(function(registryResult) {
          return includes(registryResult, atVersion)
      });
  }

}
