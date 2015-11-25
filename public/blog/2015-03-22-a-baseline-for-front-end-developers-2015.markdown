---
layout: post
title: "A Baseline for Front-End [JS] Developers: 2015"
date: 2015-03-23 21:12
comments: true
---

It's been almost three years since I wrote [A Baseline for Front-End Developers](http://rmurphey.com/blog/2012/04/12/a-baseline-for-front-end-developers/), probably my most popular post ever. Three years later, I still get Twitter mentions from people who are discovering it for the first time.

In some ways, my words have aged well: there is, shockingly, nothing from that 2012 post that has me hanging my head in shame. Still, though: three years is a long time, and a whole lot has changed. In 2012 I encouraged people to learn browser dev tools and get on the module bandwagon; CSS pre-processors and client-side templating were still worthy of mention as new-ish things that people might not be sold on; and JSHint was a welcome relief from the \#getoffmylawn admonitions -- accurate though they may have been -- of JSLint.

It's 2015. I want to write an update, but as I sit down to do just that, I realize a couple of things. One, it's arguably not fair to call this stuff a "baseline" -- if you thought that about the original post, you'll find it doubly true for this one. One could argue we should consider the good-enough-to-get-a-job skills to be the "baseline." But there are a whole lot of front-end jobs to choose from, and getting one doesn't establish much of a baseline. For me, I don't want to get a job; I want to get invited to great jobs. I don't want to go to work; I want to go to work with talented people. And I don't want to be satisfied with knowing enough to do the work that needed to be done yesterday; I want to know how to do the work that will need to get done tomorrow.

Two, my world has become entirely JavaScript-centric: knowledge of the ins and outs of CSS has become less and less relevant to my day-to-day work, except where performance is concerned. I know there are plenty of very smart front-end developers for whom this isn't true, but I have also noticed a growing gulf between those who focus on CSS and those who focus on JavaScript. That's probably a subject for another blog post, but I bring it up just to say: I am woefully unequipped to make recommendations about what you should know about CSS these days, so I'm not going to try.

In short: if this list of things doesn't fit your vision of the front-end world, that's OK! We're both still good people. Promise.

## JavaScript

Remember back in 2009 when you read that HTML5 would be ready to use in 2014, and that seemed like a day that would never come? If so, you're well prepared for the slow-but-steady emergence of ES6 (which is now called [ES2015](https://esdiscuss.org/topic/javascript-2015), a name that is sure to catch on any day now), the next version of JavaScript. Getting my bearings with ES6 -- er, ES2015 -- is hands-down my biggest JavaScript to-do item at the moment; it is going to be somewhere between game-changing and life-altering, what with classes, real privacy, better functions and arguments, `import`-able modules, and so much more. Those who are competent and productive with the new syntax will have no trouble standing out in the JS community. Required reading:

- [Understanding ES6](https://leanpub.com/understandinges6/read/), a work-in-progress book being developed in the open by Nicholas Zakas.
- [BabelJS](http://babeljs.io/), a tool that lets you write ES6 today and "compile" it to ES5 that will run in current browsers. They also have a good [learning](http://babeljs.io/docs/learn-es6/) section.
- [ES6 Rocks](http://es6rocks.com/), with various posts that explore ES6 features, semantics, and gotchas.

Do you need to be an ES6/ES2015 expert? Probably not today, but you should know at least as much about it as your peers, and possibly more. It's also worth at least entertaining the possibility of writing your next greenfield project using ES6; the future will be here before you know it.

New language features aside, you should be able to speak fluently about the asynchronicity of JavaScript, and using callbacks and promises to manage it. You should have well-formed opinions about strategies for loading applications in the browser and communicating between pieces of an application. You should maybe have a favorite application development framework, but not at the expense of having a general understanding of how other frameworks operate, and the tradeoffs you accept when you choose one.

## Modules & Build Tools

There's no debate that modules should be the building blocks of client-side web applications. Back in 2012, there was lots of debate about what *kind* of modules we should use for building apps destined for the browser -- [AMD](https://github.com/amdjs/amdjs-api/blob/master/AMD.md) or [CommonJS](http://webpack.github.io/docs/commonjs.html). The somewhat-gross [UMD](https://github.com/umdjs/umd) wrapper arose to try to avoid answering the question while still allowing code reuse -- because hey, what's a few more bytes between friends?

I don't feel like this debate is anywhere near resolved, but this is the area where I feel like we've seen the largest transformation since my 2012 article, though perhaps that's a reflection of my personal change of heart. I'm not ready to say that I'm done with AMD, but let's just say I'm floored by how practical it has become to develop and deploy web applications using CommonJS, including modules imported with `npm`.

With much love for all that [RequireJS](http://requirejs.org/) has contributed to the module conversation, I'm a bit enamored of [webpack](http://webpack.github.io/) right now. Its features -- such as easy-to-understand build flags -- feel more accessible than RequireJS. Its hot-swap builds via its built-in dev server make for a fast and delightful development story. It doesn't force an AMD vs. CommonJS decision, because it supports both. It also comes with a ton of loaders, making it fairly trivial to do lots of common tasks. [Browserify](http://browserify.org/) is worth knowing about, but lags far behind Webpack in my opinion. Smart people I trust tell me that [systemjs](https://github.com/systemjs/systemjs) is also a serious contender in this space, but I haven't used it yet, and its docs leave me wanting. Its companion package manager [jspm](http://jspm.io/) is intriguing, allowing you to pull in modules from multiple sources including npm, but I'm a bit wary of combining those two concerns. Then again, I never thought I'd break up with AMD, yet here I seem to be, so we'll see.

I still long for a day when we stop having module and build tool debates, and there is a single module system and sharing code between arbitrary projects becomes realistic and trivial without the overhead of UMD. Ideally, the arrival of [ES6 modules](http://www.2ality.com/2014/09/es6-modules-final.html) will bring that day -- and transpilers will fill in the gaps as the day draws closer -- but I find it just as likely that we'll keep finding ways to make it complicated.

In the meantime, front-end developers need to have an opinion about at least a couple of build tools and the associated module system, and that opinion should be backed up by experience. For better or worse, JavaScript is still in a state where the module decision you make will inform the rest of your project.

## Testing

Testing of client-side code has become more commonplace, and a few new testing frameworks have arrived on the scene, including [Karma](http://karma-runner.github.io/0.12/index.html) and [Intern](https://theintern.github.io/). I find Intern's promise-based approach to async testing to be particulary pleasing, though I confess that I still write most of my tests using [Mocha](http://mochajs.org/) -- sometimes I'm just a creature of habit.

The main blocker to testing is the code that front-end devs tend to write. I gave a talk toward the end of 2012 about [writing testable JavaScript](https://www.youtube.com/watch?v=OzjogCFO4Zo), and followed up with an [article](http://alistapart.com/article/writing-testable-javascript) on the topic a few months later.

The second biggest blocker to testing remains the tooling. Webdriver is still a huge pain to work with. Continuous automated testing of a complex UI across all supported browsers continues to be either impossible, or so practically expensive that it might as well be impossible -- and never mind mobile. We're still largely stuck doing lightweight automated functional tests on a small subset of supported browser/device/OS combinations, and leaning as hard as we can on lower-level tests that can run quickly and inexpensively. This is a bummer.

If you're interested in improving the problem of untested -- or untestable -- code, the single most valuable book you can read is [Working Effectively with Legacy Code](http://www.amazon.com/Working-Effectively-Legacy-Michael-Feathers/dp/0131177052). The author, Michael Feathers, defines "legacy code" as any code that does not have tests. On the topic of testing, the baseline is to accept the truth of that statement, even if other constraints are preventing you from addressing it.

## Process Automation

You, hopefully, take for granted the existence of [Grunt](http://gruntjs.com/) for task automation. [Gulp](http://gulpjs.com/) and [Broccoli](http://broccolijs.com/) provide a different approach to automating builds in particular. I haven't used Broccoli, and I've only dabbled in Gulp, but I've definitely come to appreciate some of the limitations of Grunt when it comes to automating complex tasks that depend on other services -- especially when that task needs to run thousands of times a day.

The arrival of [Yeoman](http://yeoman.io/) was a mere 45 days away when I wrote my 2012 post. I confess I didn't use it when it first came out, but recently I've been a) starting projects from scratch using unfamiliar tech; and b) trying to figure out how to standardize our approach to developing third-party JS apps at Bazaarvoice. Yeoman really shines in both of these cases. A simple `yo react-webpack` from the command line creates a whole new project for you, with all the bells and whistles you could possibly want -- tests, a dev server, a hello world app, and more. If React and Webpack aren't your thing, there's probably a generator to meet your needs, and it's also easy to create your own.

Given that Yeoman is a tool that you generally use only at the start of a project, and given that new projects don't get started all the time, it's mostly just something worth knowing about. Unless, of course, you're also trying to standardize practices across projects -- then it might be a bit more valuable.

Broccoli has gotten its biggest adoption as the basis for ember-cli, and  folks I trust suggest that pairing may get a makeover -- and a new name -- to form the basis of a Grunt/Yeoman replacement in the future. Development on both Grunt and Yeoman has certainly slowed down, so it will be interesting to see what the future brings there.

## Code Quality

If you, like me, start to twitch when you see code that violates a project's well-documented style guide, then tools like [JSCS](http://jscs.info/) and [ESLint](http://eslint.org/) are godsends, and neither of them existed for you to know about them back in 2012. They both provide a means to document your style guide rules, and then verify your code against those rules automatically, before it ever makes it into a pull request. Which brings me to &hellip;

## Git

I don't think a whole lot has changed in the world of Git workflows since 2012, and I'd like to point out Github *still* hasn't made branch names linkable on the pull request page, for f@#$s sake.

You should obviously be comfortable working with feature branches, rebasing your work on the work of others, squashing commits using interactive rebase, and doing work in small units that are unlikely to cause conflicts whenever possible. Another Git tool to add to your toolbox if you haven't already is the ability to run hooks -- specifically, pre-push and pre-commit hooks to run your tests and execute any code quality checks. You can write them yourself, but tools like [ghooks](https://www.npmjs.com/package/ghooks) make it so trivial that there's little excuse not to integrate them into your workflow.

## Client-Side Templating

This may be the thing I got the most wrong in my original post, for some definition of "wrong." Client-side templating is still highly valuable, of course -- so valuable that it will be built-in to ES2015 -- but there can be too much of a good thing. It's been a hard-earned lesson for lots of teams that moving all rendering to the browser has high costs when it comes to performance, and thus has the "generate all the HTML client-side" approach rightfully fallen out of favor. Smart projects are now generating HTML server-side -- maybe even pre-generating it, and storing it as static files that can be served quickly -- and then "hydrating" that HTML client-side, updating it with client-side templates as events warrant.

The new expectation here -- and I say this to myself as much as to anyone else -- is that you are considering the performance implications of your decisions, and maybe not restricting yourself quite so thoroughly to the realm of the browser. Which, conveniently, leads to &hellip;

## Node

You say you know JavaScript, so these days I expect that you can hop on over to the Node side of things and at least pitch in, if not get at least knee-deep. Yes, there are file systems and streams and servers -- and some paradigms that are fundamentally different from front-end dev -- but front-end developers who keep the back end at arm's length are definitely limiting their potential.

Even if your actual production back-end doesn't use Node, it's an invaluable tool when it comes to keeping you from getting blocked by back-end development. At the very least, you should be familiar with how to [initialize a Node project](https://docs.npmjs.com/cli/init); how to set up an [Express](http://expressjs.com/) server and routes; and how use the [request](https://www.npmjs.com/package/request) module to proxy requests.

## The End

Thanks to Paul, Alex, Adam, and Ralph for their thorough review of this post, and for generously pointing out places where I could do better. Thank them for the good parts, and blame any errors on me.

With that, good luck. See you again in another three years, perhaps.