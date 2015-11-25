---
layout: post
title: "Refactoring setInterval-based polling"
date: 2013-02-04 15:30
comments: true
categories: javascript
---

I came across some code that looked something like this the other day, give or take a few details.

```javascript
App.Helpers.checkSyncStatus = function() {
  if (App.get('syncCheck')) { return; }

  var check = function() {
    $.ajax('/sync_status', {
      dataType: 'json',
      success: function(resp) {
        if (resp.status === 'done') {
          App.Helpers.reloadUser(function() {
            clearInterval(App.get('syncCheck'));
            App.set('syncCheck', null);
          });
        }
      }
    });
  };

  App.set('syncCheck', setInterval(check, 1000));
};
```

The code comes from an app whose server-side code queries a third-party service for new data every now and then. When the server is fetching that new data, certain actions on the front-end are forbidden. The code above was responsible for determining when the server-side sync is complete, and putting the app back in a state where those front-end interactions could be allowed again.

You might have heard that `setInterval` can be a dangerous thing when it comes to polling a server\*, and, looking at the code above, it's easy to see why. The polling happens every 1000 seconds, *whether the request was successful or not*. If the request results in an error, or fails, or takes more than 1000 milliseconds, `setInterval` doesn't care -- it will blindly kick off another request. The interval only gets cleared when the request succeeds and the sync is done.

The first refactoring for this is easy: switch to using `setTimeout`, and only enqueue another request once we know what happened with the previous one.

```javascript
App.Helpers.checkSyncStatus = function() {
  if (App.get('syncCheck')) { return; }

  var check = function() {
    $.ajax('/sync_status', {
      dataType: 'json',
      success: function(resp) {
        if (resp.status === 'done') {
          App.Helpers.reloadUser(function() {
            App.set('syncCheck', null);
          });
        } else {
          setTimeout(check, 1000);
        }
      }
    });
  };

  App.set('syncCheck', true);
};
```

Now, if the request fails, or takes more than 1000 milliseconds, at least we won't be perpetrating a mini-DOS attack on our own server.

Our code still has some shortcomings, though. For one thing, we aren't handling the failure case. Additionally, the rest of our application is stuck looking at the `syncCheck` property of our `App` object to figure out when the sync has completed.

We can use a promise to make our function a whole lot more powerful. We'll return the promise from the function, and also store it as the value of our `App` object's `syncCheck` property. This will let other pieces of code respond to the outcome of the request, whether it succeeds or fails. With a simple guard statement at the beginning of our function, we can also make it so that the `checkSyncStatus` function will return the promise immediately if a status check is already in progress.

```javascript
App.Helpers.checkSyncStatus = function() {
  var syncCheck = App.get('syncCheck');
  if (syncCheck) { return syncCheck; }

  var dfd = $.Deferred();
  App.set('syncCheck', dfd.promise());

  var success = function(resp) {
    if (resp.status === 'done') {
      App.Helpers.reloadUser(function() {
        dfd.resolve();
        App.set('syncCheck', null);
      });
    } else {
      setTimeout(check, 1000);
    }
  };

  var fail = function() {
    dfd.reject();
    App.set('syncCheck', null);
  };

  var check = function() {
    var req = $.ajax('/sync_status', { dataType: 'json' });
    req.then( success, fail );
  };

  setTimeout(check, 1000);

  return dfd.promise();
};
```

Now, we can call our new function, and use the returned promise to react to the *eventual outcome* of the sync:

```javascript
App.Helpers.checkSyncStatus().then(
  // this will run if the sync was successful,
  // once the user has been reloaded
  function() { console.log('it worked'); },

  // this will run if the sync failed
  function() { console.log('it failed'); }
);
```

With a few more lines of code, we've made our function safer -- eliminating the possibility of an out-of-control `setInterval` -- and also made it vastly more useful to other pieces of the application that care about the outcome of the sync.

While the example above used [jQuery's promises implementation](http://api.jquery.com/deferred.promise/), there are plenty of other implementations as well, including Sam Breed's [underscore.Deferred](https://github.com/wookiehangover/underscore.Deferred), which mimics the behavior of jQuery's promises without the dependency on jQuery.

<small>* [Websockets](http://www.html5rocks.com/en/tutorials/websockets/basics/) are a great way to eliminate polling all together, but in the case of this application, they weren't an option.</small>