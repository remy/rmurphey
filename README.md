# How to

```
npm install
node server.js
open http://localhost:9000
```

It's running dynamically, and the posts are all in `public/blog`, layout etc uses Jade (sorry).

There's likely to be traces of my own blog in there, so search for my name!

The posts, archive, about and RSS all look to work.

Search uses elasticsearch and a build process, it's a bit noddy, but I think you were using google search before, so you might want to rip that out.

All the action and routing happens in `server.js` - it's pretty basic and simple, but if you want some method available to you in the jade layouts, stick it on the global in `server.js` (like `global.moment = moment`, nasty, but who cares?).

I'll update with the release process if you want fully static site (I use a free combo of Heroku and Cloudflare for https and hosting) (but it's in the `Makefile` which...is kinda lame too).

If you don't use it - totally cool too ❤

'night!