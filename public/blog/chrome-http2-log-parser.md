# Chrome HTTP/2 Log Parser

When [I wrote about HTTP/2 earlier this week](/blog/building-for-http2),
one of my complaints was that there wasn't a great way to visualize what
was going on with an HTTP/2 connection — and that Chrome's dev tools often
tell a story that seems to conflict with the story told by Chrome's
net-internals log.

I spoke with Andy Davies the day after I published that post, and he pointed
me to [a tweet from Moto Ishizawa](https://twitter.com/summerwind/status/653579247152271360)
from October, showing a screenshot of an "HTTP/2 Stream Analyzer." As far as I
can tell, the thing in the screenshot hasn't been released. I hope it will be,
but in the meantime I've written [chrome-http2-log-parser](https://www.npmjs.com/package/chrome-http2-log-parser),
a Node module that takes the text from Chrome's net-internals HTTP/2 tab and
spits out more useful data, including some basic text visualizations.

<img src="/img/chrome-http2-log-parser.png" class="main"/>

If you're not familiar, the output of Chrome's HTTP/2 net-internals log,
here's a little bit of one:

```log
t=    6952 [st=       0]    HTTP2_STREAM_UPDATE_RECV_WINDOW
                            --> delta = 15663105
                            --> window_size = 15728640
t=    6952 [st=       0]    HTTP2_SESSION_SENT_WINDOW_UPDATE_FRAME
                            --> delta = 15663105
                            --> stream_id = 0
t=    6953 [st=       1]    HTTP2_SESSION_SEND_HEADERS
                            --> fin = true
                            --> :authority: 52.23.178.48
                                :method: GET
                                :path: /index-separate.html?push=/common/libs/combined.js
                                :scheme: https
                                accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8
                                accept-encoding: gzip, deflate, sdch
                                accept-language: en-US,en;q=0.8
                                upgrade-insecure-requests: 1
                                user-agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.86 Safari/537.36
                            --> priority = 4
                            --> stream_id = 1
                            --> unidirectional = false
t=    7020 [st=      68]    HTTP2_SESSION_RECV_SETTINGS
                            --> clear_persisted = false
                            --> host = "52.23.178.48:443"
t=    7020 [st=      68]    HTTP2_SESSION_RECV_SETTING
                            --> flags = 0
                            --> id = 2
                            --> value = 0
```

This goes on for hundreds of lines, making it essentially impossible to
visualize what's happening.

The chrome-http2-log-parser module reads a file that contains this log and
turns it into:

- An array of objects, one for each log entry.
- An object with a property for each stream ID, where the value of the
property is an array of objects representing each log entry for the stream.

It also offers two text-based reporters (I'm hoping to also make an HTML reporter
soo); they provide time-based visualizations of the data at a resolution of
your choosing:

```
0:	             *
1:	S            R                     D         D
2:	             PDR       DDDD       DDDDDD   DDDDDD                                  A
3:	                                      S          DRDDDDDDDDDDDD
5:	                                        S             R  DDDDDDDDDD                              DDDD          D
7:	                                        S               R     DDDDDDDD                           DDD           D
9:	                                        S               R        DDDDDDDD                        DDD           D
11:	                                        S                R         DDDDDD  DD                    DDD           D
13:	                                        S                R                  DDDDDDDD              DDDD         D
15:	                                        S                R                     DDDDDDDD            DDD         D
17:	                                        S                R                       DDDDDDDD          DDD         D
19:	                                        S                R                         DDDDD       DDDDDDDD        D
21:	                                        S                R                                     DDDDDDDDDDDDDD  DD
```

You can grab it on
[npm](https://www.npmjs.com/package/chrome-http2-log-parser) — note that
you'll need Node 4.2 or greater:

```
npm install chrome-http2-log-parser
```

If this is useful to you, I'd love to hear about it; likewise if you have ideas
about how to make it better. I've written up a couple of TODO items at the end
of the README, if you're so inclined :)
