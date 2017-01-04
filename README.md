# OK, Ready!

A simple interactive CLI tool for uniformly checking a few different
software registries.

## Command Usage

### `help`

```
(ok)--> help

  Commands:

    help [command...]                               Provides help for a given command.
    exit                                            Exits application.
    property <keyValue>                             Set an individual property
    properties [setAll...]                          Retrieve or set all properties
    tags                                            List published tags
    versions [options] <registry> [projects...]     List published project versions
    echo [message...]                               Outputs the passed message.
    check [options] <registry> <project> <version>  Check whether a particular project version exists
```

### Initialized with the rollup-starter-project

This project used the [rollup-starter-project][rollup-starter-project] to get
started with [rollup][rollup] (and [babel][babel]) for writing
npm packages using ES6 modules. Writing npm packages with a [jsnext:main][jsnext:main] allows
users of your package to choose whether they use it using the traditional
`require` function understood by node.js, or using the `import` statement added
in ES6 which can result in smaller bundles through live-code inclusion static
analysis.

[rollup-starter-project]: https://github.com/rollup/rollup-starter-project
[babel]: https://github.com/babel/babel
[jsnext:main]: https://github.com/rollup/rollup/wiki/jsnext:main
[rollup]: https://github.com/rollup/rollup
