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
					Promise.resolve(self.animationFunction(currentFrame, index++, length)).then(_ => window.requestAnimationFrame(animationSchedule));
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
	loop(limit = _ => true, afterIteration) {
		return new Promise(resolve => {
			const self = this;
			const start = Date.now();
			let currentIteration = 0;
			const loopSchedule = async () => {
				if(limit(currentIteration)) {
					self.animate().then(_ => Promise.resolve(afterIteration(currentIteration++, limit)).then(_ => loopSchedule()));
				} else {
					resolve([self, Date.now() - start]);
				}
			}
			loopSchedule();
		});
	}
	//
	constructor(frames, animation) {
    this.framesDone = [];
		this.frames = frames;
		this.animationFunction = animation;
	}
}

export default Frames;
