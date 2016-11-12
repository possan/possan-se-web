function BackgroundEffect() {

	var c1 = document.getElementById('c1');

	var width = 100;
	var height = 100;
	var density = 1;

	var targetnumpoints = 100;

	var pts = [];

	var GS = 400;
	var QW = 10000;
	var MAXLINE = 300;
	var LR = 2;

	function resize() {
		width = window.innerWidth;
		height = window.innerHeight;
		density = window.devicePixelRatio || 1;
		width *= density;
		height *= density;
		targetnumpoints = Math.ceil(width * height / 40000);
		if (targetnumpoints > 100)
			targetnumpoints = 100;
		c1.width = width;
		c1.height = height;
	}

	function PT() {
		this.x = 100;
		this.y = 100;
		this.qx = -10;
		this.qy = -10;
		this.qid = 0;
		this.fx = 0;
		this.fy = 0;
		this.vx = 0;
		this.vy = 0;

		this.tg = 0;
		this.tgx = 0;
		this.tgy = 0;

		this.respawn();
	}

	PT.prototype.respawn = function() {
		this.x = Math.random() * width;
		this.y = Math.random() * height;
		this.qx = -10;
		this.qy = -10;
		this.qid = 0;
		var s = Math.random() * 1;
		s = s * s * s;
		s += 0.5;
		s *= 0.3;
		s *= density;
		var a = Math.random() * Math.PI * 2.0;
		this.tfx = s * Math.sin(a);
		this.tfy = s * Math.cos(a);
		this.fx = 0;
		this.fy = 0;
		this.vx = 0;
		this.vy = 0;
	}

	PT.prototype.touch = function(tx, ty) {
		this.tg = 1;
		this.tgx = tx;
		this.tgy = ty;
	}

	PT.prototype.update = function() {
		// if (this.t < 100) {
		// this.t ++;

		// if (pt > 0) {
		// 	var dx = px - this.x;
		// 	var dy = py - this.y;
		// 	dx *= 0.001;
		// 	dy *= 0.001;
		// 	this.x += dx;
		// 	this.y += dy;

		// } else {

		// this.vx += this.tfx;
		// this.vy += this.tfy;

		this.x += this.vx;
		this.y += this.vy;
		// }

		this.vx *= 0.9;
		this.vy *= 0.9;
		this.vx += this.fx;
		this.vy += this.fy;

		this.fx *= 0.9;
		this.fy *= 0.9;

		if (this.tg == 1) {
			var dx = this.x - this.tgx;
	 		var dy = this.y - this.tgy;
			var dl = Math.sqrt(dx * dx + dy * dy);
			var df = dl / 500.0;
			if (df < 1.0) {
				dx /= dl;
				dy /= dl;
				if (dl < 0.001) dl = 0.001;
				var f = 1000.0 / dl;
				this.fx += f * dx;
				this.fy += f * dy;
			}
		}

		var dfx = this.tfx - this.fx;
		var dfy = this.tfy - this.fy;
		this.fx += dfx * 0.9;
		this.fy += dfy * 0.9;



		if (this.x > width) this.x -= width;
		if (this.y > height) this.y -= height;
		if (this.x < 0) this.x += width;
		if (this.y < 0) this.y += height;
		this.qx = Math.floor((this.x + 0) / GS);
		this.qy = Math.floor((this.y + 0) / GS);
		this.qid = this.qy * QW + this.qx;

		this.tg = 0;
	}

	PT.prototype.render = function(ctx) {
		ctx.strokeStyle = 'rgba(255,255,255,0.2)';
		ctx.beginPath();
		ctx.moveTo(this.x, this.y-density);
		ctx.lineTo(this.x, this.y+density);
		ctx.stroke();
	}


	function render() {
		if (pts.length < targetnumpoints) {
			pts.push(new PT());
		}
		if (pts.length > targetnumpoints) {
			pts.pop();
		}

		var ctx = c1.getContext('2d');

		ctx.fillStyle = '#123';
		ctx.fillRect(0,0, width, height);

		for (var i=0; i<pts.length; i++) {
			var p = pts[i];
			p.update();
		}

		var lines = [];
		for (var j=0; j<pts.length; j++) {
			for (var i=0; i<pts.length; i++) {
				if (i != j) {
					var p1 = pts[i];
					var p2 = pts[j];
					if (p1.qx >= (p2.qx - 1) && p1.qx <= (p2.qx + 1) &&
						p1.qy >= (p2.qy - 1) && p1.qy <= (p2.qy + 1)) {
						var dx = p1.x - p2.x;
						var dy = p1.y - p2.y;
						var dl = Math.sqrt(dx * dx + dy * dy);
						if (dl < MAXLINE) {
							lines.push({
								a: p1,
								b: p2,
								d: dl
							});
						}
					}
				}
			}
		}

		// console.log(lines);

		lines.forEach(function(l) {
			if (l.d > MAXLINE)
				return;

			var br = 1.0 - (l.d / MAXLINE);// Math.sin(l.d * Math.PI / 100);

			// br -= Math.abs(Math.sin(l.d / 1.0));
			if (br < 0.0)
				br = 0.0;

			br *= br;
			// br = 1;

			if (br < 0.01)
				return;

			br *= 0.5;

			ctx.strokeStyle = 'rgba(255,255,255,'+br+')';
			ctx.beginPath();
			ctx.moveTo(l.a.x, l.a.y);
			ctx.lineTo(l.b.x, l.b.y);
			ctx.stroke();

			// ctx.strokeStyle = 'rgba(255,255,255,0.2)';
			// ctx.beginPath();
			// ctx.moveTo(l.a.x-LR, l.a.y);
			// ctx.lineTo(l.a.x+LR, l.a.y);
			// ctx.moveTo(l.a.x, l.a.y-LR);
			// ctx.lineTo(l.a.x, l.a.y+LR);
			// ctx.moveTo(l.b.x-LR, l.b.y);
			// ctx.lineTo(l.b.x+LR, l.b.y);
			// ctx.moveTo(l.b.x, l.b.y-LR);
			// ctx.lineTo(l.b.x, l.b.y+LR);
			// ctx.stroke();
		});

		// var qw = Math.
		for (var i=0; i<pts.length; i++) {
			var p = pts[i];
			p.render(ctx);
		}

		requestAnimationFrame(render);
		// setTimeout(render.bind(this), 100);
	}

	resize();
	render();

	window.addEventListener('resize', resize.bind(this));

	c1.imageSmoothingEnabled = false;

	c1.addEventListener('mousemove', function(e) {
		var px = e.clientX * density;
		var py = e.clientY * density;
		for (var i=0; i<pts.length; i++) {
			var p = pts[i];
			p.touch(px, py);
		}
	});

	c1.addEventListener('touchmove', function(e) {
		var px = e.touches[0].clientX * density;
		var py = e.touches[0].clientY * density;
		for (var i=0; i<pts.length; i++) {
			var p = pts[i];
			p.touch(px, py);
		}
	});
};

module.exports = BackgroundEffect;

