/*
 * This is the main entry point for your package.
 *
 * You can import other modules here, including external packages. When
 * bundling using rollup you can mark those modules as external and have them
 * excluded or, if they have a jsnext:main entry in their package.json (like
 * this package does), let rollup bundle them into your dist file.
 */

import Vorpal from 'vorpal';

import * as nconf from 'nconf';

import { from, just } from 'most'
import { forEach, keys, template, has, assign, includes } from 'lodash';

import PyPi from './pypi.js';
import Npm from './npm.js';
import GitHub from './github.js';
import Maven from './maven.js';
import NuGet from './nuget.js';

nconf.argv()
 .env()
 .file({ file: './ok.json' })
 .defaults({verbose: false})
 ;

forEach(registries, (registry, registryName) => {
  var registryOptions = nconf.get(registryName);
  registry.configure(registryOptions);
});

let registries = {
  pypi: new PyPi(nconf.get('pypi')),
  npm: new Npm(nconf.get('npm')),
  github: new GitHub(nconf.get('github')),
  maven: new Maven(nconf.get('maven')),
  nuget: new NuGet(nconf.get('nuget'))
}

let vorpal = Vorpal();
vorpal.localStorage('ok-ready');

function report(data) {
  vorpal.log(data);
  // forEach(data, (value) => {
  //   vorpal.log(value);
  // })
}


function loadProperties() {
  let loadedProperties = {};
  try {
    loadedProperties = JSON.parse(vorpal.localStorage.getItem('properties')) || {};
  } catch (err) {
    vorpal.log("ERROR ", err);
    vorpal.localStorage.setItem('properties', '');
  }
  return loadedProperties;
}

function storeProperties(properties) {
  vorpal.localStorage.setItem('properties', JSON.stringify(properties));
}

function substituteVariables(command) {
  var compiledCommand = template(command);
  return compiledCommand(loadProperties());
}

vorpal
  .command('property <keyValue>', 'Set an individual property')
  .alias('prop')
  .action(function(args, callback) {
    let properties = loadProperties();
    let newProperty = eval('({' + args.keyValue + '})');
    assign(properties, newProperty);
    storeProperties(properties);
    callback();
  });

vorpal
  .command('properties [setAll...]', 'Retrieve or set all properties')
  .alias('props')
  .action(function(args, callback) {
    if (has(args, 'setAll')) {
      let newPropertiesString = args.setAll.join(' ');
      let propertiesAsObject = eval('(' + newPropertiesString + ')');
      storeProperties(propertiesAsObject);
    } else {
      vorpal.log(loadProperties());
    }
    callback();
  });

vorpal
  .command('tags', 'List published tags')
  .action(function(args, callback) {
    this.log('tagged');
    callback();
  })
  ;

vorpal
  .command('versions <registry> [projects...]', 'List published project versions')
  .autocomplete(keys(registries))
  .validate(function(args) {
    if (includes(keys(registries), args.registry)) {
      return true;
    } else {
      return `Registry "${args.registry}" not recognized. Please pick one of ${keys(registries)}`;
    }
  })
  .action(function(args, callback) {
    let registry = registries[args.registry];
    from(args.projects)
      .map(registry.versionsOf)
      .await()
      .recoverWith(e => just([e]))
      .forEach(list => report(list))
      .then(callback());
  })
  .option('-v --verbose')
  ;

vorpal
  .command('echo [message...]', 'Outputs the passed message.')
  .alias('print')
  .parse(substituteVariables)
  .action(function(args, callback) {
    const finalMessage = args.message.join(' ');
    vorpal.log(finalMessage);
    callback();
  })
  ;

vorpal
  .command('check <registry> <project> <version>', 'Check whether a particular project version exists')
  .parse(substituteVariables)
  .autocomplete(keys(registries))
  .action(function(args, callback) {
    const VERBOSE = args.options.verbose;
    let registry = registries[args.registry];
    return registry.checkFor(args.project, args.version)
      .then(
        res => {
          if (VERBOSE) vorpal.log(`Checked ${args.registry} for ${args.project} at version ${args.version}`)
          vorpal.log(res);
        },
        err => {
          vorpal.log(err);
        }
      )
      .then(callback);
  })
  .option('-v --verbose');

vorpal
    .history('ok-ready')
    .delimiter('(ok)--> ')
    .show();
