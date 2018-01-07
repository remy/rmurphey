'use strict';

var http = require('http');
var fs = require('fs');
var st = require('st');
var glob = require('glob');
var harp = require('harp');
var querystring = require('querystring');
var outputPath = __dirname + '/www';
var port = process.env.PORT || 9000;
var router = require('router-stupid');
var blogs = require('./public/blog/_data.json');
var pages = Object.keys(require('./public/_data.json'));
var slugs = Object.keys(blogs);
var route = router();
var Promise = require('promise'); // jshint ignore:line
var fourohfour = '';
var mount;
var moment = require('moment');
var pkg = require('./package');
var htmlFiles = [];

// this line, although dirty, ensures that Harp templates
// have access to moment - which given the whole partial
// import hack doesn't work consistently across dynamic vs
// compiled, this is the cleanest solution.
global.moment = moment;

// we use versions to cachebust our CSS & JS, but we only
// cachebust on minor or major releases. A new blog post is
// considered a patch, and therefore doesn't require a rebuild
// of the entire /www directory.
global.version = pkg.version.split('.').slice(0, 2).join('.');

global.modified = function (filename) {
  var stat = null;
  try {
    stat = fs.statSync(__dirname + '/public/' + filename + '.md');
    return stat.mtime;
  } catch (e) {
    return new Date(0);
  }
};

function redirect(res, url) {
  res.writeHead(302, { location: url });
  res.end();
}

/* allow fast redirects to edit pages */
route.get(/^\/(.*)\/edit(\/)?$/, function (req, res, next) {
  var match = [];

  // first check it's not a static file in /public
  if (pages.indexOf(req.params[1]) !== -1) {
    match = [req.params[1]];
  }

  if (match.length === 0) {
    if (req.params[1].indexOf('/') !== -1) {
      // just take the last bit and assume this this is a blog post
      match = req.params[1].split('/').slice(-1);
      match[0] = 'blog/' + match[0];
    } else {
      match = slugs.filter(function (slug) {
        return slug.indexOf(req.params[1]) !== -1;
      }).map(function (s) {
        s = 'blog/' + s;
        return s;
      });
    }
  }

  if (match.length) {
    var url = 'https://github.com/rmurphey/rmurphey/blob/master/public/' +
      match.shift() + '.md';
    return redirect(res, url);
  }

  next();
});


/* redirect /blog/{slug} to the date formatted url */
route.all('/{blog}?/{post}', function (req, res, next) {
  var post = blogs[req.params.post];
  if (post) {
    var url = moment(post.date).format('/YYYY/MM/DD/') + req.params.post;
    redirect(res, '/blog' + url);
    return;
  }
  next();
});

route.all(/^\/([0-9]{4})\/([0-9]{1,2})\/([0-9]{1,2})\/([a-z0-9\-].*?)(\/)?$/, function (req, res, next) {
  redirect(res, '/blog' + req.url);
});

/* main url handler: /{year}/{month}/{day}/{slug} */
route.all(/^\/blog\/([0-9]{4})\/([0-9]{1,2})\/([0-9]{1,2})\/([a-z0-9\-].*?)(\/)?$/, function (req, res, next) {
  var params = req.params;
  var post = blogs[params[4]];

  if (post && post.date) {
    // test if the date matches

    // note that with moment, we're specifying the parse format
    var date = moment(post.date.split(' ')[0]);
    var requestDate = params.slice(1, 4).join('-');

    if (date.format('YYYY-MM-DD') !== requestDate) {
      return next();
    }

    if (params[5] === '/') {
      redirect(res, req.url.replace(/(.)\/$/, '$1'));
      return;
    }

    // this allows Harp to pick up the correct post
    req.url = '/blog/' + params[4];
  }

  next();
});

/* handle /{year} in url */
route.get(/^\/([0-9]{4})(\/?)$/, function (req, res, next) {
  req.url = '/archives/' + req.params[1] + '/';
  next();
});

/* match slug partial and redirect to post */
route.all(/^\/([a-z0-9\-]+)(\/?)$/i, function (req, res, next) {
  // first check it's not a static file in /public
  if (pages.indexOf(req.params[1]) !== -1) {
    return next();
  }

  var match = slugs.filter(function (slug) {
    return slug.indexOf(req.params[1]) !== -1;
  });

  if (match.length) {
    var matched = match.slice(-1).pop(); // use the latest
    var post = blogs[matched];
    var url = moment(post.date).format('/YYYY/MM/DD/') + matched;
    redirect(res, url);
    return;
  }

  next();
});

var server = function (root) {
  // manually glob all the .html files so that we can navigate
  // without .html on the end of the urls
  glob('**/*.html', {
    cwd: root,
    dot: false,
  }, function (er, files) {
    htmlFiles = files.map(function (file) {
      return '/' + file;
    });
  });

  // use st module for static cached routing
  mount = st({
    path: root,
    url: '/',
    index: 'index.html', // server index.html for directories
    passthrough: true // pass through if not found, so we can send 404
  });

  console.log('compilation complete');
};

function run() {
  if (process.env.NODE_ENV === 'production') {
    // lastly...
    route.get('*', function (req, res, next) {

      // simplify the url (remove the ?search) and test if
      // we have a file that exists (in `htmlFiles`)
      req.url = req.url.replace(/\?.*$/, '').replace(/(.)\/$/, '$1');
      if (htmlFiles.indexOf(req.url + '.html') !== -1) {
        // then we requested /foo/bar and we know there's a
        // generated file that matches
        req.url += '.html';
      }

      // if our server is ready, respond using the st module
      // and if it's a 404, respond with `serve404`.
      if (mount) {
        mount(req, res, function serve404() {
          res.writeHead(404);
          // res.end(fourohfour);
        });
      } else {
        res.writeHead(404);
        res.end();
      }
    });

    console.log('Running harp-static on ' + port);
    console.log('Env: ' + process.env.NODE_ENV);
    http.createServer(route).listen(port);

    fourohfour = require('fs').readFileSync(outputPath + '/404.html');
    server(outputPath, port);
  } else {

    // this is used for offline development, where harp is
    // rebuilding all files on the fly.
    route.get(/^\/archives$/, function (req, res) {
      redirect(res, '/archives/');
    });
    route.get(/^\/drafts$/, function (req, res) {
      redirect(res, '/drafts/');
    });
    route.all('*', harp.mount(__dirname));
    route.all('*', function (req, res) {
      req.url = '/404';
      harp.mount(__dirname)(req, res);
    });
    console.log('Running harp-static on ' + port);
    console.log('Env: ' + process.env.NODE_ENV);
    http.createServer(route).listen(port);

    server(__dirname + '/public');
  }
}

function stat(slug) {
  return new Promise(function (resolve) {
    fs.stat(__dirname + '/public/blog/' + slug + '.md', function (error, stat) {
      if (error) {
        console.log(error);
        resolve({
          slug: filename,
          date: new Date(0),
          created: new Date(blogs[slug].date)
        });
      } else {
        resolve({
          slug: slug,
          date: stat.mtime,
          created: new Date(blogs[slug].date)
        });
      }
    });
  });
}

Promise.all(slugs.map(stat)).then(function (dates) {
  global.recent = dates.sort(function (a, b) {
    return a.created.getTime() - b.created.getTime();
  }).reverse().slice(0, 3);

  if (process.argv[2] === 'compile') {
    process.env.NODE_ENV = 'production';
    harp.compile(__dirname, outputPath, function (errors) {
      if (errors) {
        console.log(JSON.stringify(errors, null, 2));
        process.exit(1);
      }

      process.exit(0);
    });
  } else {
    run();
  }
});
