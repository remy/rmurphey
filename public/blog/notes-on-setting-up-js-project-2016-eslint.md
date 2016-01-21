# Notes on setting up a JS project, circa 2016: ESLint

I wrote previously about setting up a client-side JS project to use [Webpack](http://rmurphey.com/blog/2016/01/19/notes-on-setting-up-js-project-2016-webpack) and [Babel](http://rmurphey.com/blog/2016/01/20/notes-on-setting-up-js-project-2016-babel-es6). In this post, I'll cover the next step: adding [ESLint](http://eslint.org/) to the project to keep the JavaScript code clean and following a consistent style.

This is the easiest step of all — so easy that at first I felt silly writing a post about it, but there were a couple of things worth noting.

To start, I installed ESLint to the project using `npm install --save-dev eslint`. Next, from the root directory of the project, I asked ESLint to create an initial configuration file for me:

```sh
./node_modules/eslint/bin/eslint.js --init
```

This gave me the option of using one of several popular ESLint configurations, or generating my own. I decided to generate my own, which took me through the following prompts:

```none
? How would you like to configure ESLint? Answer questions about your style
? What style of indentation do you use? Spaces
? What quotes do you use for strings? Single
? What line endings do you use? Unix
? Do you require semicolons? Yes
? Are you using ECMAScript 6 features? Yes
? Where will your code run? Node, Browser
? Do you use JSX? No
? What format do you want your config file to be in? JavaScript
Successfully created .eslintrc.js file in /Users/rmurphey/personal/js-games
```

When I was done, like it says above, I had an .eslintrc.js file in the root of my project. It looked like this:

```js
module.exports = {
    "rules": {
        "indent": [
            2,
            4
        ],
        "quotes": [
            2,
            "single"
        ],
        "linebreak-style": [
            2,
            "unix"
        ],
        "semi": [
            2,
            "always"
        ]
    },
    "env": {
        "es6": true,
        "node": true,
        "browser": true
    },
    "extends": "eslint:recommended"
};
```

The generated file was indented at four spaces, and that's when I realized that I hadn't been asked about my preferred indentation width, just whether I wanted tabs or spaces. I adjusted the `indent` rule to enforce two-space indentation ... and re-indented the file:

```js
// ...
"indent": [
  2,
  2
],
// ...
```

It's also worth noting one of the last lines in the file: `"extends": "eslint:recommended"`. ESLint has a set of recommended rules — such as disallowing `console` statements — that are automatically enforced when this `extends` is present. I can override them if I want by setting new values for those rules in my .eslintrc.js file.

I wanted to try out my setup, but I didn't want to keep typing the full path to the ESLint executable, so I added a new npm script to lint all the files in the client/ directory:

```json
"lint": "eslint client/**"
```

When I ran `npm run lint`, though, I got a slew of errors about files in client/dist/. This directory is where my Webpack build goes, and I don't actually care about linting that code, because it's uglified. To deal with this, I created an [.eslintignore](http://eslint.org/docs/user-guide/configuring.html#ignoring-files-and-directories) file and added `client/dist/*` to. With that change, running `npm run lint` just showed me a few errors for the files I care about in the client/ directory.

There were a couple more changes I wanted to make to my ESLInt setup. For one, ESLint outputs a warning about the fact that I've ignored some files. I decided to live dangerously and suppress the warnings by passing `--quiet` to the `eslint` command. Secondly, I know from experience that ESLint can get slow on large code bases; the `--cache` option addresses that. The `--cache` option causes ESLint to create an .eslintcache file, so I added that to my .gitignore file as well.

None of this would be very valuable if I had to remember to lint my files whenever I make a change. There are editor plugins that will read my .eslintrc.js file and show me errors, but I wanted to make sure I couldn't commit code that doesn't pass ESLint. The [ghooks](https://www.npmjs.com/package/ghooks) module lets me make sure ESLint runs as a pre-commit hook; I installed it with `npm install --save-dev ghooks`, and then added a few lines to my package.json:

```json
"config": {
  "ghooks": {
    "pre-commit": "npm run lint"
  }
}
```

## Closing Thoughts

I love how well the [ESLint rules are documented](http://eslint.org/docs/rules/), and the error output of ESLint makes it easy to find the documentation when you want to learn more about the rule that your code has violated. ESLint also makes it easy to [override a rule](http://eslint.org/docs/user-guide/configuring#configuring-rules) for a file or even for a single line. Adding ghooks to the mix allows for future improvements, such as enforcing commit message formats, running tests pre-push, etc.

You can see the code as of this post [here](https://github.com/rmurphey/js-games/tree/4b744613241831ea88576057d6f8c4f20bd7863c).
