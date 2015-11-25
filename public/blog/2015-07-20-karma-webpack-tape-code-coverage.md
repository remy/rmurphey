---
layout: post
title: "Browser Testing and Code Coverage with Karma, Tape, and Webpack"
date: 2015-07-20 14:00
comments: true
---

We recently set up a new project at Bazaarvoice for centralizing common UI modules. We started by using [node-tap](https://github.com/isaacs/node-tap) for unit tests, but given that these are *UI* modules, we quickly switched to using [tape](https://github.com/substack/tape), because it has a fairly easy browser testing story with the help of [Karma](http://karma-runner.github.io/0.13/index.html).

One thing that node-tap provided that tape did not provide out of the box was the ability to measure the code coverage of unit tests. Karma *does* provide this, but getting it hooked up while using [Webpack](http://webpack.github.io/) -- which is our build tool of choice these days -- wasn't quite as clear as I would have liked. If you're looking to use Karma, tape, and Webpack, then hopefully this post will help you spend a bit less time than I did.

## What You'll Need

By the time it was all said and done, I needed to `npm install` the following modules:

- karma
- karma-phantomjs-launcher
- karma-chrome-launcher
- karma-tap
- karma-webpack
- karma-coverage
- istanbul-instrumenter-loader
- tape

The directory structure was simple:

- a root directory, containing karma.conf.js and package.json
- a lib subdirectory, containing module files
- a test/unit subdirectory, containing the unit tests

An example application file at lib/global/index.js looked like this:

```js
/**
 *  @fileOverview Provides a reference to the global object
 *
 *  Functions created via the Function constructor in strict mode are sloppy
 *  unless the function body contains a strict mode pragma. This is a reliable
 *  way to obtain a reference to the global object in any ES3+ environment.
 *  see http://stackoverflow.com/a/3277192/46867
 */
'use strict';

module.exports = (new Function('return this;'))();
```

An example test in test/unit/global/index.js looked like this:

```js
var test = require('tape');
var global = require('../../../lib/global');

test('Exports window', function (t) {
  t.equal(global, window);
  t.end();
});
```

## Testing CommonJS Modules in the Browser

The applications that consume these UI modules use Webpack, so we author the modules (and their tests) as CommonJS modules. Of course, browsers can't consume CommonJS directly, so we need to generate files that browsers *can* consume. There are several tools we can choose for this task, but since we've otherwise standardized on Webpack, we wanted to use Webpack here as well.

Since our goal is to load the tests in the browser, we use the test file as the "entry" file. Webpack processes the dependencies of an entry file to generate a new file that contains the entry file's contents as well as the contents of its dependencies. This new file is the one that Karma will load into the browser to run the tests.

Getting this to happen is pretty straightforward with the `karma-webpack` plugin to Karma. The only catch was the need to tell Webpack how to deal with the `fs` dependency in tape. Here's the initial Karma configuration that got the tests running:

```js
var webpack = require('webpack');

module.exports = function(config) {
  config.set({
    plugins: [
      require('karma-webpack'),
      require('karma-tap'),
      require('karma-chrome-launcher'),
      require('karma-phantomjs-launcher')
    ],

    basePath: '',
    frameworks: [ 'tap' ],
    files: [ 'test/**/*.js' ],

    preprocessors: {
      'test/**/*.js': [ 'webpack' ]
    },

    webpack: {
      node : {
        fs: 'empty'
      }
    },

    webpackMiddleware: {
      noInfo: true
    },

    reporters: [ 'dots' ],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['Chrome'],
    singleRun: false
  })
};
```

However, as I mentioned above, I wanted to get code coverage information. Karma offers the [karma-coverage](https://github.com/karma-runner/karma-coverage) plugin, but that alone was insufficient in Webpack land: it would end up instrumenting the whole Webpack output -- including the test code itself! -- and thus reporting highly inaccurate coverage numbers.

I ended up reading a [karma-webpack issue](https://github.com/webpack/karma-webpack/issues/21) that told me someone else had already solved this exact problem by creating a [Webpack loader](https://github.com/deepsweet/istanbul-instrumenter-loader) to instrument modules at build time. By adjusting our Webpack configuration to only apply this loader to application modules -- not to test code or vendor code -- the Webpack output ends up properly instrumented for the karma-coverage plugin to work with it. Our final Karma config ends up looking like this:

```js
var webpack = require('webpack');

module.exports = function(config) {
  config.set({
    plugins: [
      require('karma-webpack'),
      require('karma-tap'),
      require('karma-chrome-launcher'),
      require('karma-phantomjs-launcher'),
      require('karma-coverage')
    ],

    basePath: '',
    frameworks: [ 'tap' ],
    files: [ 'test/**/*.js' ],

    preprocessors: {
      'test/**/*.js': [ 'webpack' ]
    },

    webpack: {
      node : {
        fs: 'empty'
      },

      // Instrument code that isn't test or vendor code.
      module: {
        postLoaders: [{
          test: /\.js$/,
          exclude: /(test|node_modules)\//,
          loader: 'istanbul-instrumenter'
        }]
      }
    },

    webpackMiddleware: {
      noInfo: true
    },

    reporters: [
      'dots',
      'coverage'
    ],

    coverageReporter: {
      type: 'text',
      dir: 'coverage/'
    },

    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['Chrome'],
    singleRun: false
  })
};
```

Even with the coverage hiccup, the speed with which I was able to get Karma set up the way I wanted -- and working with [TravisCI](http://travis-ci.org/) -- was nothing short of breathtaking. I'm late to the Karma party, but I had no idea it could be this easy. If you haven't checked it out yet, you should.
