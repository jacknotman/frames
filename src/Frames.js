class Frames {
  //
	animate() {
		return new Promise(resolve => {
      const self = this;
      const start = Date.now();
			const length = this.frames.length;
			let index = 0;
			const animationSchedule = async () => {
				let currentFrame = self.frames.shift();
				if(currentFrame) {
					self.framesDone.push(currentFrame);
					Promise.resolve(self.animationFunction(currentFrame, index++, length)).then(x => window.requestAnimationFrame(animationSchedule));
				} else {
					Promise.all(self.framesDone).then(values => {
						self.frames = self.framesDone;
						self.framesDone = [];
						resolve([self, Date.now() - start]);
					});
				}
			}
			window.requestAnimationFrame(animationSchedule);
		});
	}
	//
	loop() {
		console.log('looping');
	}
	//
	constructor(frames, animation) {
    this.framesDone = [];
		this.frames = frames;
		this.animationFunction = animation;
	}
}

export default Frames;
