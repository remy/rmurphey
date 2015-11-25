# Five Questions

I recently started in a new role: I'm the dev lead of a project that was
already in the hands of a group of skilled developers before I showed up, a
project whose scope and technologies extend far beyond the experiences I've had
up until now.

As you might imagine, there have been a lot of challenges, but one that's been
particularly interesting has been figuring out how to meaningfully contribute
to decisions about systems I don't intimately understand. It's easy to be
inclined to sit those conversations out: I really don't yet know enough to
participate, and the "who am I to have a say?" instinct is strong.

The problem: that attitude will ensure that I *never* know enough to
participate, and though I am definitely out of my comfort zone, my job -- the
job I asked to do, and the job I have been asked to do -- is to participate,
to learn, and to change the definition of my comfort zone.

While I may not have the project-specific experience to lean on, I'm finding
that there are a few questions that help me understand, discuss, and -- ultimately -- consent or object to a technical plan. They're questions that
seem to work well across a spectrum of discussions; they work whether we're
talking about a wholly new system, a migration from an old system, or a
solution to a particularly prickly problem.

These questions don't just help me gain a better understanding of a topic, or
help me make better decisions; they've also helped me reframe my understanding
of my role as a lead.

## Question 1: What are we doing and why?

When I hear the answer, I'm listening for whether the developer is clearly
articulating the problem and the solution. Do we clearly understand the
problem? Is the solution magical, or can we explain why it works? Are we
solving more than the problem, and thereby incurring unnecessary risk? Does the
developer agree that the work is necessary?

## Question 2: How could it go wrong?

A developer who says nothing can go wrong probably hasn't been a developer
for very long. I want to hear far-fetched scenarios, and an explanation for
why they're far-fetched. I want to hear worst-case scenarios; good developers
have already thought about these plenty, they've worked to avoid them, and
yet they acknowledge their existence. The goal of this question isn't to plan
for everything; rather, the answers provide context for poking at assumptions.

## Question 3: How will we know if it's going wrong?

This is probably my favorite question. If we're talking about developing a new
system or project, it's a question of how we'll know we're off track, which
leads to clear milestones and check-in points. If it's a migration to a new
system, or a solution to a bad bug, it's a question of how we'll know that
the new state is less good than we thought it would be. If the answer is
"customers will tell us," we're in dangerous territory. For services, I hope to hear answers about automated monitoring, but manual checks will suffice. For
new projects, I hope to hear near-term goals that will help us gauge progress.

## Question 4: What will we do if it goes wrong?

The answer to this may not always be knowable -- obviously we won't always know
the ways things will go wrong -- but it's a useful exercise nonetheless. The
answer may be "we'll have to revert back to the old system and that will be
very hard," but that at least helps me understand the stakes of the decision.
For new projects, this is a great way to identify the point of no return --
that is, the point in the project where starting over or changing course
becomes prohibitive.

## Question 5: Is there an "undo" button?

Sometimes, the worst happens. Do we have an escape hatch? How hard will it be
to add one later vs. adding one now? Again, it may be OK if we don't have a
rollback plan, but knowing that answer should help guide the decision
about whether to proceed.

---

I'm learning that a lot of what makes me kind of OK (I hope!) at this dev lead
thing isn't a deep knowledge of the specific technologies that are the
underpinning of the project (though it's certainly important that I be able to
find my way around). Rather, it's my ability to ask these questions, and to
hear and understand the answers, and interpret them into action. I'm thankful
to the team that is giving me the chance.
