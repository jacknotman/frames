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

const loopImageData = (imageData) => {
    let result = [];
    for (let i = 0; i < imageData.length; i += 4) {
        let rgbal = Array.from(Array(4)).map((_, j) => imageData[i + j]);
        rgbal.push(((0.2126 * rgbal[0]) + (0.7152 * rgbal[1]) + (0.0722 * rgbal[2])) / 255);
        result.push(rgbal);
    }
    return result;
}

function extractFramesFromVideo(videoUrl, fps = 6) {
    return new Promise(async (resolve) => {
        // fully download it first (no buffering):
        let videoBlob = await fetch(videoUrl).then((r) => r.blob()).catch(e => console.log(e));
        let videoObjectUrl = URL.createObjectURL(videoBlob);
        let video = document.createElement("video");
        let seekResolve;
        video.addEventListener("seeked", async function() {
            if (seekResolve) seekResolve();
        });

        video.src = videoObjectUrl;

        // workaround chromium metadata bug (https://stackoverflow.com/q/38062864/993683)
        while (
            (video.duration === Infinity || isNaN(video.duration)) &&
            video.readyState < 2
        ) {
            await new Promise((r) => setTimeout(r, 1000));
            video.currentTime = 10000000 * Math.random();
        }
        let duration = video.duration;

        let canvas = document.createElement("canvas");
        let context = canvas.getContext("2d", {
            willReadFrequently: true
        });
        let [w, h] = [video.videoWidth, video.videoHeight];
        canvas.width = w;
        canvas.height = h;

        let frames = [];
        let interval = 1 / fps;
        let currentTime = 0;

        while (currentTime < duration) {
            video.currentTime = currentTime;
            await new Promise((r) => (seekResolve = r));
            // 
            context.drawImage(video, 0, 0, w, h);
            //
            let result = []
            let data = context.getImageData(0, 0, w, h).data;
            frames.push(loopImageData(context.getImageData(0, 0, w, h).data));
            currentTime += interval;
        }
        resolve({
            w,
            h,
            frames
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

function scale (number, inMin, inMax, outMin, outMax) {
    return (number - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}

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

const videoFrames = extractFramesFromVideo("https://jacknotman.github.io/pages/assets/movie.mp4", 6);
const videoState = MakeQuerablePromise(videoFrames)
const ASCIIChars = `$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\|()1{}[]?-_+~<>i!lI;:,"^\`'.`.split('').reverse();

//
//
//

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
        return !videoState.isFulfilled();
    }
}, {
    animation: new Frames(prepareGlitchText('Transmission captured.\n\n'), (char, index) => {
        return doGlitchText(char, index, elements[1]);
    }),
    type: 'animate'
}, {
    animation: new Frames([1, 1], (videoFrame, index, _, self) => {
        return new Promise(resolve => {
            if (self.frames[0] === 1) {
                Promise.resolve(videoFrames).then(res => {
                    self.frames = res.frames;
					elements[2].classList.add('video');
					elements[2].append(...Array.from(Array(res.w * res.h)).map(row => {
						return document.createElement('span');
					}));
                    resolve();
                })
            } else {
                setTimeout(() => {
					[...elements[2].children].forEach((cell, i) => {
                        if(i < index * 128) {
							cell.textContent = ASCIIChars[Math.floor(ASCIIChars.length * videoFrame[i][4])];
                        	cell.style.color = `rgb(${videoFrame[i][0]},${videoFrame[i][1]},${videoFrame[i][2]})`;
						}
					});
                    resolve();
                }, (1000 / 6));
            }
        });
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