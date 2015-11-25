# Selectors in jQuery

Just a note to self: <a href="http://www.learningjquery.com/2006/12/quick-tip-optimizing-dom-traversal">Quick Tip - Optimizing DOM Traversal</a>. Avoid bare classname selectors like <code>$('.foo')</code> when possible; qualify them with an element type or, ideally, the ID of a parent element: <code>$('div.foo')</code> or <code>$('#bar .foo')</code>.