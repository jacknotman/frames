//
// Setup
//

// Import Frames.js class
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

/*
// Create an array of characters for our animation to use.
const characterArray = 
	`Hello World,
	Welcome to Frames.

	The animation scheduling protocol for Javascript. 

	683 bytes of code.
	340 gZipped. 
	Awesome.`.split('');

// Create an element for our animations
const element = document.createElement('span');
element.ariaLive = "assertive"
element.ariaBusy = "true";
document.querySelector('.content').appendChild(element);

// Loops over the above character array, printing a character approximately 
// every 40 miliseconds. 
const x = new Frames(characterArray, frame => {
	return new Promise(resolve => {
		setTimeout(() => {
			element.innerHTML += frame;
			resolve();
		}, 40);
	});
});

// Perform the animation once, once complete log the amount of time taken. 
x.animate().then(([self, time]) => {
  element.ariaBusy = "false";
  console.log(`Done in: ${time}ms`);
});

/*
//Perfrom the animation 10 times, clearing the output between each frame (except the last), after a delay of 160ms, 
//before the next frame. 
x.loop(iterationCount => {
	return iterationCount < 3;
}, (iterationCount, done) => {
	return new Promise(resolve => {
		setTimeout(() => {
			if(!done) {
				element.innerHTML = ''
			} else {
				element.ariaBusy = "false";
			};
			resolve();
		}, 160);
	});
});
*/

//
const lines = [
	'Hello World,',
	'Welcome to Frames',
	'\n',
	'The animation scheduling protocol for Javascript.',
	'\n',
	'683 bytes of code.',
	'340 gZipped.',
	'Awesome.',
];

// Create an element for our animations
const element = document.createElement('div');
element.ariaLive = "assertive"
element.ariaBusy = "true";
document.querySelector('.content').appendChild(element);

// Loops over the above character array, printing a character approximately 
// every 40 miliseconds. 
const x = new Frames(lines, line => {
	return new Promise(resolveLine => {
		let lineElement = document.createElement('div');
		element.appendChild(lineElement);
		new Frames(line.split(''), char => {
			return new Promise(resolveChar => {
				setTimeout(() => {
					let charElement = document.createElement('span');
					charElement.textContent = char;
					lineElement.appendChild(charElement);
					resolveChar();
				}, 40);
			}); 
		}).animate().then(_ => resolveLine());
	});
}).animate();