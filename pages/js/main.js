//
// Setup
//

// Import Anima
import { default as Frames } from "./../../src/Frames.js";

// Useful Hack for ios safari setting a CSS variable equal to the active viewport height.
const appHeight = () => {
  const doc = document.documentElement
  doc.style.setProperty('--app-height', `${window.innerHeight}px`)
}
window.addEventListener('resize', appHeight)
appHeight();

//
// Main
//

// Create an array of characters for our animation to use.
const characterArray2 = 'Hello World, \nWelcome to Frames. \n\nThe animation scheduling protocol for JS. \n\n488 bytes of code.\n275 gZipped.\nAwesome.'.split('');

// Create an element for our animations
const element2 = document.createElement('span');
element2.ariaLive = "assertive"
element2.ariaBusy = "true";
document.querySelector('.content').appendChild(element2);

// Loops over the above character array, printing a character approximately 
// every 40 miliseconds. 
const x = new Frames(characterArray2, frame => {
	return new Promise(resolve => {
		setTimeout(() => {
			element2.innerHTML += frame;
			resolve();
		}, 40);
	});
});

/*
x.animate().then(([self, time]) => {
  element2.ariaBusy = "false";
  console.log(`Done in: ${time}ms`);
});
*/

x.loop(10, () => {
	console.log('a');
});
