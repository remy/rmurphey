---
layout: post
title: Writing Unit Tests for Existing JavaScript
date: 2014-07-13 21:21
comments: true
---

My team at [Bazaarvoice](http://www.bazaarvoice.com/careers/) has been spending a lot of time lately thinking about quality and how we can have greater confidence that our software is working as it should.

We've long had functional tests in place that attempt to ask questions like "When a user clicks a button, will The Widget do The Thing?" These tests tell us a fair amount about the state of our product, but we've found that they're brittle -- even after we abstracted away the CSS selectors that they rely on -- and that they take approximately forever to run, especially if we want to run them in all of the browsers we support. The quality of the tests themselves is all over the map, too -- some of them are in fact unit tests, not really testing anything *functional* at all.

A few months ago we welcomed a new QA lead to our team as part of our renewed focus on quality. Having a team member who is taking a thoughtful, systematic approach to quality is a game-changer -- he's not just making sure that new features work, but rather has scrutinized our entire approach to delivering quality software, to great effect.

One of the things he has repeatedly emphasized is the need to push our tests down the stack. Our functional tests should be black-box -- writing them shouldn't require detailed knowledge of how the software works under the hood. Our unit tests, on the other hand, should provide broad and detailed coverage of the actual code base. In an ideal world, functional tests can be few and slow-ish, because they serve as an infrequent smoke test of the application; unit tests should be thorough, but execute quickly enough that we run them all the time.

Until now, our unit tests have been entirely focused on utility and framework code -- do we properly parse a URL, for example? -- not on code that's up close and personal with getting The Widget to do The Thing. I'd told myself that this was fine and right and good, but in reality I was pretty terrified of trying to bolt unit tests onto feature code of incredibly varying quality, months or even years after it was first written.

A week or so ago, thanks to some coaxing/chiding from fellow team members, I decided to bite the bullet and see just how bad it would be. A week later, I feel like I've taken the first ten steps in a marathon. Of course, taking those first steps involves making the decision to run, and doing enough training ahead of time that you don't die, so in that regard I've come a long way already. Here's what I've done and learned so far.

### Step 0

I was lucky in that I wasn't starting entirely from scratch, but if you don't already have a unit testing framework in place, don't fret -- it's pretty easy to set up. We use [Grunt](http://gruntjs.com/) with [Mocha](http://visionmedia.github.io/mocha/) as our test framework and [expect.js](https://github.com/LearnBoost/expect.js/) as our assertion library, but if I were starting over today I'd take a pretty serious look at [Intern](http://theintern.io/).

Our unit tests are organized into suites. Each suite consists of a number of files, each of which tests a single AMD module. Most of the modules under test when I started down this path were pretty isolated -- they didn't have a ton of dependencies generally, and had very few runtime dependencies. They didn't interact with other modules that much. Almost all of the existing unit test files loaded a module, executed its methods, and inspected the return value. No big deal.

Feature-related code -- especially already-written feature-related code -- is a different story. Views have templates. Models expect data. Models pass information to views, and views pass information to models. Some models need parents; others expect children. And pretty much everything depended on a global-ish message broker to pass information around.

Since the code was originally written without tests, we are guaranteed that it would be in various states of testability, but a broad rewrite for testability is of course off the table. We'll rewrite targeted pieces, but doing so comes with great risk. For the most part, our goal will be to write tests for what we have, then refactor cautiously once tests are in place.

We decided that the first place to start was with models, so I found the simplest model I could:

```javascript
define([
  'framework/bmodel',
  'underscore'
], function (BModel, _) {
  return BModel.extend({
    options : {},
    name : 'mediaViewer',

    init : function (config, options) {
      _.extend(this.options, options);
    }
  });
});
```

Why do we have a model that does approximately nothing? I'm not going to attempt to answer that, though there are Reasons -- but for the sake of this discussion, it certainly provides an easy place to start.

I created a new suite for model tests, and added a file to the suite to test the model. I could tell you that I naively plowed ahead thinking that I could just load the module and write some assertions, but that would be a lie.

### Mocking: Squire.js

I knew from writing other tests, on this project and projects in the past, that I was going to need to "mock" some of my dependencies. For example, we have a module called `ENV` that is used for ... well, way too much, though it's better than it used to be. A large portion of `ENV` isn't used by any given module, but `ENV` itself is required by essentially every model and view.

[Squire.js](https://github.com/iammerrick/Squire.js/) is a really fantastic library for doing mocking in RequireJS-land. It lets you override how a certain dependency will be fulfilled; so, when a module under test asks for `'ENV'`, you can use Squire to say "use this object that I've hand-crafted for this specific test instead."

I created an Injector module that does the work of loading Squire, plus mocking a couple of things that will be missing when the tests are executed in Node-land.

```javascript
define([
  'squire',
  'jquery'
], function (Squire, $) {
  return function () {
    var injector;

    if (typeof window === 'undefined') {
      injector = new Squire('_BV');

      injector.mock('jquery', function () {
        return $;
      });

      injector.mock('window', function () {
        return {};
      });
    }
    else {
      injector = new Squire();
    }

    return injector;
  };
});
```

Next, I wired up the test to see how far I could get without mocking anything. Note that the main module doesn't actually load the thing we're going to test -- first, it sets up the mocks by calling the `injector` function, and then it uses the created injector to require the module we want to test. Just like a normal `require`, the `injector.require` is async, so we have to let our test framework know to wait until it's loaded before proceeding with our assertions.

```javascript
define([
  'test/unit/injector'
], function (injector) {
  injector = injector();

  var MediaViewer;

  describe('MediaViewer Model', function () {
    before(function (done) {
      injector.require([
        'bv/c2013/model/mediaViewer'
      ], function (M) {
        MediaViewer = M;
        done();
      });
    });

    it('should be named', function () {
      var m = new MediaViewer({});
      expect(m.name).to.equal('mediaViewer');
    });

    it('should mix in provided options', function () {
      var m = new MediaViewer({}, { foo : 'bar' });
      expect(m.options.foo).to.equal('bar');
    });
  });
});
```

This, of course, still failed pretty spectacularly. In real life, a model gets instantiated with a component, and a model also expects to have access to an `ENV` that has knowledge of the component. Creating a "real" component and letting the "real" `ENV` know about it would be an exercise in [inventing the universe](https://www.youtube.com/watch?v=7s664NsLeFM), and this is exactly what mocks are for.

While the "real" `ENV` is a Backbone model that is instantiated using customer-specific configuration data, a much simpler `ENV` suffices for the sake of testing a model's functionality:

```javascript
define([
  'backbone'
], function (Backbone) {
  return function (injector, opts) {
    injector.mock('ENV', function () {
      var ENV = new Backbone.Model({
        componentManager : {
          find : function () {
            return opts.component;
          }
        }
      });

      return ENV;
    });

    return injector;
  };
});
```

Likewise, a "real" component is complicated and difficult to create, but the pieces of a component that this model needs to function are limited. Here's what the component mock ended up looking like:

```javascript
define([
  'underscore'
], function (_) {
  return function (settings) {
    settings = settings || {};

    settings.features = settings.features || [];

    return {
      trigger : function () {},
      hasFeature : function (refName, featureName) {
        return _.contains(settings.features, featureName);
      },
      getScope : function () {
        return 'scope';
      },
      contentType : settings.contentType,
      componentId : settings.id,
      views : {}
    };
  };
});
```

In the case of both mocks, we've taken some dramatic shortcuts: the real `hasFeature` method of a component is a lot more complicated, but in the component mock we create a `hasFeature` method whose return value can be easily known by the test that uses the mock. Likewise, the behavior of the `componentManager`'s `find` method is complex in real life, but in our mock, the method just returns the same thing all the time. Our mocks are designed to be configurable by -- and predictable for -- the test that uses it.

Knowing what to mock and when and how is a learned skill. It's entirely possible to mock something in such a way that a unit test passes but the actual functionality is broken. We actually have pretty decent tests around our real component code, but not so much around our real `ENV` code. We should probably fix that, and then I can feel better about mocking `ENV` as needed.

So far, my approach has been: try to make a test pass without mocking anything, and then mock as little as possible after that. I've also made a point of trying to centralize our mocks in a single place, so we aren't reinventing the wheel for every test.

Finally: when I first set up the injector module, I accidentally made it so that the same injector would be shared by any test that included the module. This is bad, because you end up sharing mocks across tests -- violating the "only mock what you must" rule. The injector module shown above is correct in that it returns a function that can be used to create a new injector, rather than the injector itself.

Here's what the final MediaViewer test ended up looking like:

```javascript
define([
  // This properly sets up Squire and mocks window and jQuery
  // if necessary (for running tests from the command line).
  'test/unit/injector',

  // This is a function that mocks the ENV module.
  'test/unit/mocks/ENV',

  // This is a function that mocks a component.
  'test/unit/mocks/component'
], function (injector, ENVMock, component) {
  injector = injector();

  // This will become the constructor for the model under test.
  var MediaViewer;

  // Create an object that can serve as a model's component.
  var c = component();

  // We also need to mock the ENV module and make it aware of
  // the fake component we just created.
  ENVMock(injector, { component : c });

  describe('MediaViewer Model', function () {
    before(function (done) {
      injector.require([
        'bv/c2013/model/mediaViewer'
      ], function (M) {
        MediaViewer = M;
        done();
      });
    });

    it('should be named', function () {
      var m = new MediaViewer({
        component : c
      }, {});
      expect(m.name).to.equal('mediaViewer');
    });

    it('should mix in provided options', function () {
      var m = new MediaViewer({
        component : c
      }, { foo : 'bar' });

      expect(m.options.foo).to.equal('bar');
    });
  });
});
```

### Spying: Sinon

After my stunning success with writing 49 lines of test code to test a 13-line model, I was feeling optimistic about testing views, too. I decided to tackle this fairly simple view first:

```javascript
define([
  'framework/bview',
  'underscore',
  'hbs!contentAuthorProfileInline',
  'mf!bv/c2013/messages/avatar',
  'bv/util/productInfo',
  'framework/util/bvtracker',
  'util/specialKeys'
], function (BView, _, template, msgPack, ProductInfo, BVTracker, specialKeys) {
  return BView.extend({
    name : 'inlineProfile',

    templateName : 'contentAuthorProfileInline',

    events : {
      'click .bv-content-author-name .bv-fullprofile-popup-target' : 'launchProfile'
    },

    template : template,

    msgpacks : [msgPack],

    launchProfile : function (e) {
      // use r&r component outlet to trigger full profile popup component event
      this.getTopModel().trigger( 'showfullprofile', this.model.get('Author') );

      BVTracker.feature({
        type : 'Used',
        name : 'Click',
        detail1 : 'ViewProfileButton',
        detail2 : 'AuthorAvatar',
        bvProduct : ProductInfo.getType(this),
        productId : ProductInfo.getId(this)
      });
    }
  });
});
```

It turned out that I needed to do the same basic mocking for this as I did for the model, but this code presented a couple of interesting things to consider.

First, I wanted to test that `this.getTopModel().trigger(...)` triggered the proper event, but the `getTopModel` method was implemented in `BView`, not the code under test, and without a whole lot of gymnastics, it wasn't going to return an object with a `trigger` method.

Second, I wanted to know that `BVTracker.feature` was getting called with the right values, so I needed a way to inspect the object that got passed to it, but without doing something terrible like exposing it globally.

Enter [Sinon](http://sinonjs.org) and its [spies](http://sinonjs.org/docs/#spies). Spies let you observe methods as they are called. You can either let the method still do its thing while watching how it is called, or simply replace the method with a spy.

I solved the first problem by defining my own `getTopModel` method on the model instance, and having it return an object. I gave that object a `trigger` method that was actually just a spy -- for the sake of my test, I didn't care what trigger *did*, only how it was called. Other tests [will eventually] ensure that triggering this event has the desired effect on the targeted model, but for the sake of this test, we don't care.

Here's what the test looks like:

```javascript
describe('#launchProfile', function () {
  var spy;
  var v;

  before(function () {
    spy = sinon.spy();

    v = new InlineProfile({
      // model and component are defined elsewhere
      component : component,
      model : model
    });

    model.set('Author', 'author');

    v.getTopModel = function () {
      return {
        trigger : spy
      };
    };
  });

  it('should trigger showfullprofile event on top model', function () {
    v.launchProfile();

    expect(spy.lastCall.args[0]).to.equal('showfullprofile');
    expect(spy.lastCall.args[1]).to.equal('author');
  });
});
```

I solved the second problem -- the need to see what's getting passed to `BVTracker.feature` -- by creating a `BVTracker` mock where every method is just a spy:

```javascript
// This is a mock for BVTracker that can be used by unit tests.
define([
  'underscore'
], function (_) {
  return function (injector, opts) {
    var BVTracker = {};

    injector.mock('framework/util/bvtracker', function () {
      _([
        'error',
        'pageview',
        'feature'
      ]).each(function (event) {
        BVTracker[event] = sinon.spy();
      });
    });

    return BVTracker;
  };
});
```

My test looked at the `BVTracker.feature` spy to see what it got when the view's `launchProfile` method was called:

```javascript
it('should send a feature analytics event', function () {
  v.launchProfile();

  var evt = BVTracker.feature.lastCall.args[0];

  expect(evt.type).to.equal('Used');
  expect(evt.name).to.equal('Click');
  expect(evt.detail1).to.equal('ViewProfileButton');
  expect(evt.detail2).to.equal('AuthorAvatar');
  expect(evt.bvProduct).to.equal('RatingsAndReviews');
  expect(evt.productId).to.equal('product1');
});
```

I've barely touched on what you can do with spies, or with Sinon in general. Besides providing simple spy functionality, Sinon delivers a host of functionality that makes tests easier to write -- swaths of which I haven't even begun to explore. One part I have explored is its ability to create fake XHRs and to fake whole servers, allowing you to test how your code behaves when things go wrong on the server. Do yourself a favor and spend some time reading through the excellent [docs](http://sinonjs.org/docs/).

### What to test ... and not

I've written tests now for a tiny handful of models and views. Setting up the mocks was a bit of a hurdle -- and there were plenty of other hurdles that are too specific to our project for me to talk about them in detail -- but overall, the hardest part has been figuring out what, exactly, to test. I crafted the examples above to be pretty straightforward, but reality is a lot more complicated.

Writing tests for existing code requires first understanding the code that's being tested and identifying interesting moments in that code. If there's an operation that affects the "public" experience of the module -- for example, if the value of a model attribute changes -- then we need to write a test that covers that operation's side effect(s). If there's code that runs conditionally, we need to test the behavior of that code when that condition is true -- and when it's not. If there are six possible conditions, we need to test them all. If a model behaves completely differently when it has a parent -- and this happens far too often in our code -- then we need to simulate the parent case, and simulate the standalone case.

It can be tempting to try to test the implementation details of existing code -- and difficult to realize that you're doing it even when you don't mean to. I try to stay focused on testing how other code might consume and interact with the module I'm testing. For example, if the module I'm testing triggers an event in a certain situation, I'm going to write a test that proves it, because some other code is probably expecting that event to get triggered. However, I'm not going to test that a method of a certain name gets called in a certain case -- that's an implementation detail that might change.

The exercise of writing unit tests against existing code proves to be a phenomenal incentive to write better code in the future. One comes to develop a great appreciation of methods that have return values, not side effects. One comes to loathe the person -- often one's past self -- who authored complex, nested conditional logic. One comes to worship small methods that do exactly one thing.

So far, I haven't rewritten any of the code I've been testing, even when I've spotted obvious flaws, and even when rewriting would make the tests themselves easier to write. I don't know how long I'll be able to stick to this; there are some specific views and models that I know will be nearly impossible to test without revisiting their innards. When that becomes necessary, I'm hoping I can do it incrementally, testing as I go -- and that our functional tests will give me the cover I need to know I haven't gone horribly wrong.

### Spreading the love

Our team's next step is to widen the effort to get better unit test coverage of our code. We have something like 100 modules that need testing, and their size and complexity are all over the map. Over the coming weeks, we'll start to divide and conquer.

One thing I've done to try to make the effort easier is to create a scaffolding task using Grunt. Running `grunt scaffold-test:model:modelName` will generate a basic file that includes mocking that's guaranteed to be needed, as well as the basic instantiation that will be required and a couple of simple tests.

There's another senior team member who has led an effort in the past to apply unit tests to an existing code base, and he's already warned me to expect a bit of a bumpy road as the team struggles through the inevitable early challenges of trying to write unit tests for existing feature code. I expect there to be a pretty steep hill to climb at first, but at the very least, the work I've done so far has -- hopefully -- gotten us to the top of the vertical wall that had been standing in our way.

### Further Reading

I'm not exactly the first person to write about this. You may find these items interesting:

- [On adding unit tests to existing code](http://stackoverflow.com/questions/3476054/can-unit-testing-be-successfully-added-into-an-existing-production-project-if-s)
- [On whether it's worth the effort](http://programmers.stackexchange.com/questions/207401/writing-tests-for-existing-code)
- [Working Effectively with Legacy Code](http://www.amazon.com/gp/product/0131177052)
