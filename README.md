edioop.js
=========

Event Driven Interfaces for OOP APIs - An Application Architecture Tool
--

So, the basic idea here is that I have a factory builder that rewires constructors with a specialty property to build out an event-driven interface such that when you do something like this:

<pre>
<code>
	ediObject.ediMethod('var1 value', 'var2 value');
</code>
</pre>

You could also listen and respond to that event call with this:

<pre>
<code>
	ediObject.on('ediMethod', function(e){
		console.log(e.var1); //'var1 value'
		console.log(e.var2); //'var2 value'
		console.log(e.factory.edi_id); //'EdiObjectConstructor'
	} );
</code>
</pre>

The constructor could have been defined, wired up and then the object instantiated like so:

<pre>
<code>
function EdiObjectConstructor(){
	EdiObjectConstructor.edi = {
		'ediMethod':{
			handler:function(e){
				//could access args as e.var1 and e.var2 here
			},
			args:['var1','var2']
			}
		}
	}
}

$edi.addFactory(EdiObjectConstructor);

var ediObject = $edi.EdiObjectCostructor();
</code>
</pre>

And there is bubbling from instances to factories to the namespace/utility function $edi:

<pre>
<code>
ediObject.on('ediMethod', function(e){
	console.log('instance: ' + e.var1);
} );

//HANDLERS
ediObject.factory.on('ediMethod', function(e){
	console.log('factory/type: ' + e.var1);
} );
//could also get reference via $edi.EdiObjectConstructor


//EDI OBJECT METHOD CALLS

$edi.on('ediMethod', function(e){
	console.log('global/event: ' + e.var1); 
	//any edi method of this method fired by any edi object regardless of origin factory
} );

ediObject.ediMethod('var 1 value');
//'instance: var 1 value'
//'factory/type: var 1 value'
//'global/event: var 1 value'


//assume another ediObject created by EdiObjectConstructor

otherEdiObject.ediMethod('var 1 value');
//'factory/type: var 1 value'
//'global/event: var 1 value'


//and one from a different factory that happens to use a like-named method with identical args

ediObjectFromDifferentFactory.ediMethod('var 1 value');
//'global/event: var 1 value'

</code>
</pre>

You can simulate any action by firing off an event object:

<pre>
<code>

var eventObject = {
	var1:'var 1 value';
	var2:'var 2 value';
}

ediObject.fire('ediMethod',eventObject);
//equivalent to ediObject.ediMethod('var 1 value','var 2 value');

</code>
</pre>

So, where am I going with this? Well there's a number of wins here:

1. Any new object can respond to what old code is doing without having to tweak the old code.

2. Coupling as loose as you want it. (this can be a problem when done to excess - working on an event-socketing apparatus to encourage better practice).

3. Debug. Since you can listen to events globally, it's easy to track exactly what was happening within the EDI explicit stuff and I plan on adding some tooling for this.

4. Testing. We don't need no stinking IOC wrappers. A wide array of potential argument sets can be defined via event objects and simply fired off to test functionality. I'm working on a demo of how to isolate DOM functionality from app logic (events of course) in such a way that you can test just the app logic stuff outside of the context of a browser.

5. General JS OOP convenience, IMO, is preserved. Encapsulation via closure is as easy as it ever was (just declare internal vars in your constructors) and use is entirely opt-in. I want to create something that is relatively easy to import existing code to and to as much of a degree as someone would want. I'm not a big fan of the more monolithic nature of a lot of the popular architectural libraries out there.

6. Ease of DOM isolation without reinventing the whole damned system. The DOM API is often misunderstood, IMO. It's actually great at what it was meant to be. A verbosely-named, crystal-clear self-documenting API that was meant to work in any language and then adapted/modified to fit the given paradigm. The interaction of HTML/CSS/JS has been allowing web UI debs to produce complex UI from a granular to macro scale at a faster rate than any popular production system previously implemented. My point? It didn't need a renovation or a gigantic obtuse pointlessly abstracted layer on top of it. Just an easy to way to isolate the DOM stuff from the app logic. But the critical thing is to keep your DOM stuff out of your app stuff, not to try and own every facet of client-side web development by baking it into pointless reinventions of how it all works.

Why?
--

Edioop was essentially born when I was working on some really nasty legacy code by a non-JS dev that was chock full of circular dependencies and very hard to modify without running into a bug situation that resembled whack-a-mole. There was no time for a total rewrite of that functionality so I basically ended up using jQuery's generic object events-on-the-fly system to respond to actions going on in spaghetti code so I could react without breaking the mess in unexpected ways. It felt like cheating but I saw potential there for app logic separation from DOM concerns so I designed something a bit more formal.

I am not using jQuery for this iteration of edioop however, as I wanted something that was neutral to any JS platform context and JQ's time as a DOM normalizer with convenient side-benefits is coming to a close. For the web examples, edioop relies on a slightly modified version of Node.js's event system with the intention that it will also be easy to use for Node.js projects since the same API is in use.

Ideas/Coming Soon
--

I'll hit this later, but among other things, the $edi method will get some convenience stuff, like the ability to set and respond to events on any object generically (similar to JQ's thing where you can do like so: <code>$(someNonDOMObj).on('yay',handler)</code> and actually trigger'yay' on that same jq-wrapped object). An event-socketing system to make it easy to define handlers for events an edi object responds to filtered by factory or specific instances. There's also potential for validating arguments and setting contracts. For now I think I'm more interested in simply being able to re-use existing edi handlers and interfaces with potential for merging and overriding handlers. On validation, however, I do want to work out some standardized data object types for data-binding wins.

