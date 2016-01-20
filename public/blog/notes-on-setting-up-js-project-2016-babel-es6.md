# Notes on setting up a JS project, circa 2016: Babel and ES6

I wrote previously about [setting up a client-side JS project to use Webpack](http://rmurphey.com/blog/2016/01/19/notes-on-setting-up-js-project-2016-webpack). You can [see the code as it stands as of that last post](https://github.com/rmurphey/js-games/tree/503f10cbc144fa73b114a56eb8cf44ab68728758). In this post, I'll cover the next step: using Webpack and [Babel]() to convert ES6 code into code that can be used in all modern browsers.

Why ES6? I'm pretty late to the ES6 bandwagon, but after using it on a couple of projects recently, I'm sold just based on the convenience of [fat arrow functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions), [block scoping](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let), [constants](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/const) and [destructuring](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment) — nevermind the [features](https://github.com/lukehoban/es6features) that go far beyond sugar.

Thankfully, using ES6 in a project that already uses Webpack is straightforward, though it *does* require installing a lot of things.

As of the last post, my webpack.config.js looked like this:

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

I also had a JS file (client/number-guessing/index.js) that had a simple `console.log` statement in it. I needed to modify this JS file to have some ES6 goodness in it, in order to test whether our new Webpack setup works:

```js
let foo = () => {
  console.log('it works');
};

foo();
```

Before making any changes to my Webpack config, I checked to see what the output would be if I ran my current build script, `npm run build`. Surprisingly, this worked, even though I hadn't done any Webpack setup to deal with ES6 code. When I looked at the output in client/dist/number-guessing.js, I saw at the end of the file that the code in client/number-guessing/index.js hadn't been transpiled down to ES5 — the fat-arrow function was still there. I knew that, when my Babel config was working, I'd see the fat-arrow function converted into a normal ES5 function.

Configuring Webpack to use Babel to transform my ES6 code was pretty straightforward. First, I needed to install the Babel basics:

```sh
npm install --save-dev babel-core babel-loader babel-preset-es2015
```

Next, I added a `module.loaders` property to my Webpack config. This new section tells Webpack to use the [Babel loader](https://github.com/babel/babel-loader) on any JS file, *except for* JS files in the node_modules directory. Importantly, the Babel loader doesn't do anything by default — you have to tell it to use the [es2015 preset](https://babeljs.io/docs/plugins/preset-es2015/) to convert code from ES6 (ES2015) to ES5.

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
  module : {
    loaders : [
      {
        test : /.js$/,
        exclude : /node_modules/,
        loader : 'babel',
        query : {
          presets : [
            'es2015'
          ]
        }
      }
    ]
  },
  devServer : {
    contentBase : __dirname
  }
};
```

Now, when I run `npm run build`, I can see at the end of the output in dist/number-guessing.js that the fat-arrow function has been converted to an ES5 function; my Babel loader is working. However, it is *really slow* — far slower than my old, Babel-free build. To make this a bit better for local development, I set the `cacheDirectory` setting for Babel to `true` as long as the code isn't running in a production environment:

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
  module : {
    loaders : [
      {
        test : /.js$/,
        exclude : /node_modules/,
        loader : 'babel',
        query : {
          cacheDirectory : !(process.env.NODE_ENV === 'production'),
          presets : [
            'es2015'
          ]
        }
      }
    ]
  },
  devServer : {
    contentBase : __dirname
  }
};
```

Now that I have Webpack set up to transpile ES6 code to ES5, I can use all of the ES6 goodness — [classes](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes), [imports](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import), [exports](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/export), and [much more](https://github.com/lukehoban/es6features).

## Closing Thoughts

It's annoying that the Babel loader doesn't do anything out of the box — this is a change from Babel 5 to Babel 6. Other than that, getting Webpack to transform ES6 code to ES5 is pretty straightforward — at least until you try to write tests, which is a topic for another post.

You can see the code as of this post [here](https://github.com/rmurphey/js-games/tree/6192eaff86d0d580c5000298f3a79e1ec83485ea).
