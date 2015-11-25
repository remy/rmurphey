# Solution for Google Map contents not showing

I just spent more time than was reasonable trying to figure out why some Javascript I was using to show a Google map on one site wasn't working to show the map on another site. The map controls and copyright were rendering, but there was no actual map.

Turns out the problem wasn't with my Javascript; I had a CSS rule that was setting overflow:hidden on all divs within a container, and the divs created by the Google map API were getting that rule too. No good. I wrote a new CSS rule to set overflow:visible on all divs inside the map container -- problem solved.