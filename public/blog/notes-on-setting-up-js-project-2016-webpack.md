# Notes on setting up a JS project, circa 2016: Webpack

I'm working on a project that may or may not see the light of day: a collection of simple games written in JavaScript. The goal of the project is to help JavaScript learners understand how to break moderately complex problems into their constituent parts; in the process, the project will also show the use of modern JavaScript tooling. A secondary goal for me is to write about the process of working on the project; this post is an attempt at that.

The project is going to consist of both code and content, so, to start, I created a content/ directory and a client/ directory. I know that one of the games I want to show will be a simple number-guessing game, so I made a number-guessing/ directory. I also ran `npm init` to generate a package.json file. When I was done with this initial setup, this is what my files looked like:

```none
/js-games
  /client
    /number-guessing
  /content
  package.json
```

I knew that I wanted to use [Webpack](https://webpack.github.io/), and I wanted to make sure I got it set up before I got too far with anything else. To verify that Webpack was working, I'd need some basic JS and HTML. I created a file client/number-guessing/index.js, and put a simple `console.log('it works')` inside; I also created a file client/number-guessing/index.html, and added the following:

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Number Guessing</title>
  </head>
  <body>
    <script src="./number-guessing.js"></script>
  </body>
</html>
```

With these pieces in place, I was ready to take a stab at configuring Webpack.

## Setting up Webpack

First, I needed to install the Webpack npm module, along with the Webpack development server:

```
npm install --save-dev webpack webpack-dev-server
```

Next, I needed to create my Webpack config. Traditionally, this file goes in the root directory of a project, alongside the package.json; however, for a project like this, I felt like it made more sense for the Webpack configuration file to be with the client files, so I created client/webpack.config.js.

```none
/js-games
  /client
    /number-guessing
      index.html
      index.js
    webpack.config.js
  /content
  package.json
```

I knew that I would want to create a separate bundle for each game, so I would need [multiple "entry points"](https://webpack.github.io/docs/multiple-entry-points.html) in my Webpack config, one for each game's index.js file. With that in mind, this was my first Webpack config:

```js
var path = require('path');

module.exports = {
  entry : {
    'number-guessing' : './number-guessing/index'
  },
  output : {
    path : path.join(__dirname, 'dist'),
    filename : "[name].js"
  }
};
```

Before I went any farther, I wanted to try it out. First, I ran `cd client` to move into the client/ directory. Then, from the client directory, I ran:

```sh
../node_modules/webpack/bin/webpack.js
```

This was the output:

```
-> % ../node_modules/webpack/bin/webpack.js
Hash: 3dec0922a524080dea35
Version: webpack 1.12.11
Time: 41ms
             Asset     Size  Chunks             Chunk Names
number-guessing.js  1.41 kB       0  [emitted]  number-guessing
   [0] ./number-guessing/index.js 25 bytes {0} [built]
```

Seems good. I opened the file client/dist/number-guessing.js and inspected it; after the Webpack loader code, at the very end of the file I saw my `console.log` statement. My simple file had been built as expected; later, I could use that file to load other modules, and configure Webpack to Uglify the output, transpile ES6 code to ES5, and more.

## Setting up the Webpack dev server

Next, I wanted to set up the Webpack development server. This server serves static files from your filesystem, and also watches your JS files, updating the build whenever there are changes. I wanted to use it to serve the HTML file, which would in turn load the built version of my JS.

Still in the client directory, I ran:

```sh
../node_modules/webpack-dev-server/bin/webpack-dev-server.js
```

This was the output:

```
-> % ../node_modules/webpack-dev-server/bin/webpack-dev-server.js
http://localhost:8080/webpack-dev-server/
webpack result is served from /
content is served from /Users/rmurphey/personal/js-games/client
Hash: 3dec0922a524080dea35
Version: webpack 1.12.11
Time: 71ms
             Asset     Size  Chunks             Chunk Names
number-guessing.js  1.41 kB       0  [emitted]  number-guessing
chunk    {0} number-guessing.js (number-guessing) 25 bytes [rendered]
    [0] ./number-guessing/index.js 25 bytes {0} [built]
webpack: bundle is now VALID.
```

I opened the URL from the output (http://localhost:8080/webpack-dev-server/), which presented me with a simple UI provided by the Webpack server. I clicked on the number-guessing link, and when the page loaded, I saw my message in the console. However, the URL was still http://localhost:8080/webpack-dev-server/, and my actual HTML wasn't being loaded.

I wanted to be able to access my test page directly, so I tried navigating to http://localhost:8080/number-guessing/. It loaded, but there was now an error in the console: the page was trying to access http://localhost:8080/number-guessing/number-guessing.js, and was getting a 404 in response. It seemed that if I wanted to be able to access my test page directly, I was going to need to change the reference to my script in the HTML.

Looking back at the output from when I started the Webpack server, I saw `webpack result is served from /` -- this means that my "built" JavaScript was served from the server root. I tried loading http://localhost:8080/number-guessing.js and, indeed, it worked. I changed the script tag in my HTML to reflect the actual location of my built JavaScript bundle, one level up from the HTML file:

```html
<script src="../number-guessing.js"></script>
```

With this change, the number-guessing HTML now worked whether I accessed it via the http://localhost:8080/number-guessing/ URL or by clicking on the link in the Webpack server UI.

## Adding an npm script

So far, I had been running Webpack commands directly. This project may eventually need a tool like [gulp](http://gulpjs.com/) or [grunt](http://gruntjs.com/) for task automation, but for now I figured I would just use an [npm script](https://docs.npmjs.com/misc/scripts) as a shortcut for the command to start the server.

I edited my project's package.json to add a new `"serve"` entry to the `"scripts"` object:

```
"serve": "webpack-dev-server --config ./client/webpack.config.js",
```

In an npm script, I can skip providing the full path to an executable; npm knows to look in the right places to find `webpack-dev-server`. Since my config was in a non-standard location, I had to pass its location to the command.

When I ran `npm run serve`, this was the output:

```sh
-> % npm run serve

> js-games@0.0.1 serve /Users/rmurphey/personal/js-games
> webpack-dev-server --config ./client/webpack.config.js

Hash: b74b27e56bc0a032a890
Version: webpack 1.12.11
Time: 28ms

ERROR in Entry module not found: Error: Cannot resolve 'file' or 'directory' ./number-guessing/index in /Users/rmurphey/personal/js-games
webpack: bundle is now VALID.
http://localhost:8080/webpack-dev-server/
webpack result is served from /
content is served from /Users/rmurphey/personal/js-games
```

Though Webpack said my bundle was "VALID", the error on the line before made clear that something was wrong: Webpack was looking for the client/number-guessing/index.js file in the wrong place: in number-guessing/index.js instead. Even though my webpack.config.js file was in the client/ directory, it seemed Webpack was looking for the file one level up, where package.json was. Even running `npm run serve` from inside the client/ directory didn't change this.

To address this, I needed to tell Webpack where to start its search, using the [`context` configuration option](https://webpack.github.io/docs/configuration.html#context). I modified my webpack.config.js to add a context:

```js
var path = require('path');

module.exports = {
  context : __dirname,
  entry : {
    'number-guessing' : './number-guessing/index'
  },
  output : {
    path : path.join(__dirname, 'dist'),
    filename : "[name].js"
  }
};
```

With this change, the build was working, but now when I opened the server in the browser, I saw that my project's root directory was being served -- I only wanted the content/ directory to be served. Fixing this required another change to my Webpack config, to configure the dev server to use a different directory as its "content base":

```js
var path = require('path');

module.exports = {
  context : __dirname,
  entry : {
    'number-guessing' : './number-guessing/index'
  },
  output : {
    path : path.join(__dirname, 'dist'),
    filename : "[name].js"
  },
  devServer : {
    contentBase : __dirname
  }
};
```

With this change, my npm script was now showing the same thing I was seeing earlier, when I ran the command to start the dev server directly.

I made three more small changes: adding the `--hot` option, to enable [hot module replacement](https://webpack.github.io/docs/hot-module-replacement-with-webpack.html); adding the `--open` option, to automatically open a browser to the dev server whenever I run it; and adding the [`--inline`](https://webpack.github.io/docs/webpack-dev-server.html#inline-mode) option to automatically reload the page when I make changes to the JavaScript:

```
"serve": "webpack-dev-server --hot --open --inline --config ./client/webpack.config.js"
```

Lastly, I added a script to generate a build:

```
"build": "webpack --config ./client/webpack.config.js"
```

## Closing Thoughts

Setting this all up took less time than writing this post, but that's due largely to the fact that I've done this kind of setup several times before. I knew what I needed, and past experience gave me good instincts when something wasn't working quite like I hoped. The Webpack docs are pretty good if you already know what you're doing, but I can imagine they're painfully opaque if you don't.

If you don't want to use one of the many boilerplates that exist, then my main advice would be: "baby steps." Get a tiny thing working, and commit that; then move on to the next tiny thing. It's the process I followed in the setup I outlined above, and it helped me have confidence each step of the way.

You can see the code as of this post [here](https://github.com/rmurphey/js-games/tree/1fe5862861181749f53ba54ff74698f3d4499f8e).
