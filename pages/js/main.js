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

/*
const lines = [
    'Hello World,',
    'Welcome to Frames.',
    '\n',
    'The animation scheduling protocol for Javascript.',
    '\n',
    '683 bytes of code.',
    '340 gZipped.',
    'Awesome.',
].map(line => line.split('').map((char, i, arr) => {
    return {
        char,
        lockWhen: Math.floor(Math.random() * arr.length)
    }
}));

const randomChars = `$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\|()1{}[]?-_+~<>i!lI;:,"^\`'.`.split('');

// Create an element for our animations
const element = document.createElement('div');
element.ariaLive = "assertive"
element.ariaBusy = "true";
document.querySelector('.content').appendChild(element);

// 
/*
new Frames(lines, line => {
    return new Promise(resolveLine => {
        let lineElement = document.createElement('div');
        element.appendChild(lineElement);
        new Frames(line, (char, index) => {
            return new Promise(resolveChar => {
                setTimeout(() => {
                    //
                    let charElement = document.createElement('span');
                    charElement.dataset.lockWhen = char.lockWhen;
                    charElement.dataset.origChar = char.char;
                    lineElement.appendChild(charElement);
                    //
                    lineElement.childNodes.forEach(node => {
                        if (Number(node.dataset.lockWhen) > index && node.dataset.origChar != '\n' && node.dataset.origChar != ' ') {
                            node.textContent = randomChars[(Math.floor(Math.random() * randomChars.length))];
                        } else {
                            node.textContent = node.dataset.origChar;
                        }
                    });
                    //
                    resolveChar();
                }, 40);
            });
        }).animate().then(_ => resolveLine(line));
    });
}).animate().then(([self, x]) => {
	console.log(self);
})

new Frames(lines, line => {
    return new Promise(resolveLine => {
        let lineElement = document.createElement('div');
        element.appendChild(lineElement);
        new Frames(line, (char, index) => {
            return new Promise(resolveChar => {
                setTimeout(() => {
                    //
                    let charElement = document.createElement('span');
                    charElement.dataset.lockWhen = char.lockWhen;
                    charElement.dataset.origChar = char.char;
                    lineElement.appendChild(charElement);
                    //
                    lineElement.childNodes.forEach(node => {
                        if (Number(node.dataset.lockWhen) > index && node.dataset.origChar != '\n' && node.dataset.origChar != ' ') {
                            node.textContent = randomChars[(Math.floor(Math.random() * randomChars.length))];
                        } else {
                            node.textContent = node.dataset.origChar;
                        }
                    });
                    //
                    resolveChar();
                }, 40);
            });
        }).animate().then(_ => resolveLine(line));
    });
}).loop(iterationCount => {
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

const prepareGlitchText = (str) => {
    return str.split('').map((char, i, arr) => {
        return {
            char,
            lockWhen: Math.floor(Math.random() * arr.length)
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
                    node.textContent = randomChars[(Math.floor(Math.random() * randomChars.length))];
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

const randomChars = `$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\|()1{}[]?-_+~<>i!lI;:,"^\`'.`.split('');

const sequence = [{
    animation: new Frames(prepareGlitchText('Intercepting Transmission...\n\n'), (char, index) => {
        return doGlitchText(char, index, elements[0]);
    }),
    type: 'animate'
}, {
    animation: new Frames('-\\|/'.split(''), (char, index) => {
        return doRollingText(char, index, elements[1]);
    }),
    type: 'loop',
    count: 3
}, {
    animation: new Frames(prepareGlitchText('Transmission captured.'), (char, index) => {
        return doGlitchText(char, index, elements[1]);
    }),
    type: 'animate'
}];

const elements = Array.from(Array(sequence.length)).map(_ => {
    const element = document.createElement('div');
    element.ariaLive = "assertive"
    element.ariaBusy = "true";
    document.querySelector('.content').appendChild(element);
    return element;
});

new Frames(sequence, animation => {
    return new Promise(resolve => {
        if (animation.type === 'animate') {
            animation.animation.animate().then(_ => resolve());
        } else {
            animation.animation.loop(iterationCount => iterationCount < animation.count).then(_ => resolve());
        }
    });
}).animate();