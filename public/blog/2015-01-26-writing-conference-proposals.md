---
layout: post
title: "Writing Conference Proposals"
date: 2015-01-26 21:00
comments: true
---

I've had several [office hours](http://rmurphey.com/blog/2015/01/11/office-hours/) sessions in the last couple of weeks, and one topic that comes up again and again is how to write a talk description.

If you think about it, conference organizers don't have a whole lot to go on when they're choosing talks, unless they already know who you are. Even if your name is well-known, though, organizers may still not know who you are -- lots of conferences are taking a [blind approach](http://weareallaweso.me/for_curators/) to selecting speakers. That means that no matter who you are, your talk description might be the only thing organizers have on which to base their decision. When you give your talk, you'll need to engage your audience; the abstract is your chance to engage the organizer.

After answering the question several times, I've realized that I have a pretty explainable -- some might call it formulaic -- approach to writing abstracts for a certain common type of talk. It works well for talks about how you solved a problem, talks about how you came to learn a thing you didn't know, and even "10 things you didn't know about X" talks. I thought I'd try to explain it here.

## Paragraph 1: The context

The first paragraph is where you set the scene, and make it clear to your reader that they have been in the situation you're going to talk about. This is where you establish a connection, baiting a hook that you'll set later.

> You've got the hang of this whole JavaScript thing. Your code works on ancient browsers, and positively sings on new ones. AMD, SPA, MVC -- you can do that stuff in your sleep.

## Paragraph 2: Well, actually ...

The second paragraph is where you break the bad news, which savvy readers may already know: the thing you laid out in the first paragraph is more complicated than it seems, or has downsides that people don't realize, or generally is a bad approach ... but only with the benefit of hindsight, which you just happen to have.

> But now your users are trying to type in your Very Important Form, and nothing is showing up; that widget that's supposed to end up in a certain div is showing up somewhere completely different; and, rarely but not never, your app just doesn't load at all. You *thought* you had the hang of this whole JavaScript thing, but now you're in the world of third-party JavaScript, where all you control is a single script tag and where it's all but impossible to dream up every hostile environment in which your code will be expected to work. "It works on my machine" has never rung quite so hollow.

## Paragraph 3: The promise

You've successfully induced a bit of anxiety in your reader -- and a strong desire to know what they don't know. The hook is set, so the last paragraph is the time to promise to relieve that anxiety -- but only if your talk is chosen!

> In this talk, we'll take a look at some of the delightful bugs we've had to solve at Bazaarvoice while working on the third-party JavaScript app that collects and displays ratings and reviews for some of the world's largest retailers. We'll also look at some strategies for early detection -- and at some scenarios where you are just plain SOL.

## Next

It turns out that in the process of writing your abstract, you've also written the most basic outline for your talk: on stage, you'll want to set the context, explain the complexity, then deliver on your promise. Pretty handy, if you ask me.
