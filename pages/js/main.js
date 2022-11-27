//
// Setup
//

// Import Frames.js class
import {
	default as Frames
} from "./../../src/Frames.js";

//
//
// Utils
//
//

// Useful Hack for ios safari setting a CSS variable equal to the active viewport height.
const appHeight = () => {
	const doc = document.documentElement
	doc.style.setProperty('--app-height', `${window.innerHeight}px`)
}
window.addEventListener('resize', appHeight)
appHeight();

//
//
// Helpers
//
//

function scale(number, inMin, inMax, outMin, outMax) {
	return (number - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}

const loopImageData = (imageData) => {
	let result = [];
	for (let i = 0; i < imageData.length; i += 4) {
		let rgbal = Array.from(Array(4)).map((_, j) => imageData[i + j]);
		rgbal.push(((0.2126 * rgbal[0]) + (0.7152 * rgbal[1]) + (0.0722 * rgbal[2])) / 255);
		result.push(rgbal);
	}
	return result;
}

const getVideoFrames = (numberFrames, urlBase) => {
	const canvas = document.createElement('canvas');
	const context = canvas.getContext("2d", {
		willReadFrequently: true,
	});
	let [w, h] = [0, 0];

	let x = Array.from(Array(numberFrames)).map((_, i) => {
		return new Promise(resolve => {
			const index = i + 1;
			fetch(`${urlBase}${index}.png`).then(r => r.blob()).then(imageBlob => {
				const imageObjectURL = URL.createObjectURL(imageBlob);
				var img = new Image();
				img.addEventListener("load", () => {
					URL.revokeObjectURL(img.src);
					[w, h] = [img.naturalWidth, img.naturalHeight];
					canvas.width = w;
					canvas.height = h;
					context.drawImage(img, 0, 0);
					resolve(loopImageData(context.getImageData(0, 0, w, h).data));
				});
				img.setAttribute('src', imageObjectURL);
			});
		});
	});

	return new Promise(resolve => {
		Promise.all(x).then(frames => {
			resolve({
				w,
				h,
				frames
			});
		});
	});
}

function MakeQuerablePromise(promise) {
	// Don't modify any promise that has been already modified.
	if (promise.isFulfilled) return promise;

	// Set initial state
	var isPending = true;
	var isRejected = false;
	var isFulfilled = false;

	// Observe the promise, saving the fulfillment in a closure scope.
	var result = promise.then(
		function(v) {
			isFulfilled = true;
			isPending = false;
			return v;
		},
		function(e) {
			isRejected = true;
			isPending = false;
			throw e;
		}
	);

	result.isFulfilled = function() {
		return isFulfilled;
	};
	result.isPending = function() {
		return isPending;
	};
	result.isRejected = function() {
		return isRejected;
	};
	return result;
}

//
//
// Main
//
//

const prepareGlitchText = (str) => {
	return str.split('').map((char, i, arr) => {
		return {
			char,
			lockWhen: Math.floor(scale(Math.random(), 0, 1, 0.5, 1) * arr.length)
		}
	});
}

const doGlitchText = (char, index, element) => {
	return new Promise(resolveChar => {
		setTimeout(() => {
			let charElement = document.createElement('span');
			charElement.dataset.lockWhen = char.lockWhen;
			charElement.dataset.origChar = char.char;
			element.appendChild(charElement);
			//
			element.childNodes.forEach(node => {
				if (Number(node.dataset.lockWhen) > index && node.dataset.origChar != '\n' && node.dataset.origChar != ' ') {
					node.textContent = ASCIIChars[(Math.floor(Math.random() * ASCIIChars.length))];
				} else {
					node.textContent = node.dataset.origChar;
				}
			});
			resolveChar();
		}, 40);
	});
}

const doRollingText = (char, index, element) => {
	return new Promise(resolve => {
		setTimeout(() => {
			let charElem = document.createElement('span');
			charElem.textContent = char;
			element.replaceChildren(charElem);
			resolve();
		}, 100);
	});
}

//
//
//

const videoFrames = getVideoFrames(36, 'https://jacknotman.github.io/pages/assets/video/out');
const videoState = MakeQuerablePromise(videoFrames)
const ASCIIChars = `$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\|()1{}[]?-_+~<>i!lI;:,"^\`'.`.split('').reverse();

const sequence = [{
	animation: new Frames(prepareGlitchText('\nIntercepting Transmission...\n\n'), (char, index) => {
		return doGlitchText(char, index, elements[0]);
	}),
	type: 'animate'
}, {
	animation: new Frames('-\\|/'.split(''), (char, index) => {
		return doRollingText(char, index, elements[1]);
	}),
	type: 'loop',
	iterationFunction: i => {
		return i < 3 || !videoState.isFulfilled();
	}
}, {
	animation: new Frames(prepareGlitchText('Transmission captured.\n'), (char, index) => {
		return doGlitchText(char, index, elements[1]);
	}),
	type: 'animate'
}, {
	animation: new Frames(prepareGlitchText('\nFrom:\n'), (char, index) => {
		return doGlitchText(char, index, elements[2]);
	}),
	type: 'animate'
}, {
	animation: new Frames(prepareGlitchText('hello@h2ml.agency\n\n'), (char, index) => {
        let linkElem = elements[3].querySelector('a');
        if(!linkElem) {
            linkElem = document.createElement('a');
            linkElem.href="mailto:hello@h2ml.agency";
            linkElem.alt="Email us";
            elements[3].appendChild(linkElem);
        }
		return doGlitchText(char, index, linkElem);
	}),
	type: 'animate'
}, {
	animation: new Frames([1, 1], (videoFrame, index, _, self) => {
		return new Promise(resolve => {
			if (self.frames[0] === 1) {
				Promise.resolve(videoFrames).then(res => {
					self.frames = res.frames;
					elements[4].classList.add('video');
					elements[4].append(...Array.from(Array(res.w * res.h)).map(row => {
						return document.createElement('span');
					}));
					resolve();
				})
			} else {
				setTimeout(() => {
					[...elements[4].children].forEach((cell, i) => {
						if (i < index * 256) {
							cell.textContent = ASCIIChars[Math.floor(ASCIIChars.length * videoFrame[i][4])];
							cell.style.color = `rgb(${videoFrame[i][0]},${videoFrame[i][1]},${videoFrame[i][2]})`;
						}
					});
					resolve();
				}, (1000 / 6));
			}
		});
	}),
	type: 'loop',
	iterationFunction: i => true,
	leaveAfter: (256 * 8) + 40,
}, {
	animation: new Frames(prepareGlitchText('\nMessage Received:\n'), (char, index) => {
		return doGlitchText(char, index, elements[5]);
	}),
	type: 'animate'
}, {
	animation: new Frames(prepareGlitchText(`${new Date().toISOString()}`), (char, index) => {
		return doGlitchText(char, index, elements[6]);
	}),
	type: 'animate'
}, {
	animation: new Frames(prepareGlitchText('\nMessage:\n'), (char, index) => {
		return doGlitchText(char, index, elements[7]);
	}),
	type: 'animate'
}, {
	animation: new Frames(prepareGlitchText(`We're here to help you tell your digital story.`), (char, index) => {
		return doGlitchText(char, index, elements[8]);
	}),
	type: 'animate'
}];

const elements = Array.from(Array(sequence.length)).map(_ => {
	const element = document.createElement('div');
	element.ariaLive = "assertive"
	element.ariaBusy = "true";
    element.classList.add('terminal');
	document.querySelector('.content').appendChild(element);
	return element;
});

new Frames(sequence, animation => {
	return new Promise(resolve => {
		if (animation.type === 'animate') {
			animation.animation.animate().then(_ => resolve());
		} else {
			if (animation.leaveAfter) {
				animation.animation.loop(animation.iterationFunction);
				setTimeout(() => {
					resolve();
				}, animation.leaveAfter)
			} else {
				animation.animation.loop(animation.iterationFunction).then(_ => resolve());
			}
		}
	});
}).animate();