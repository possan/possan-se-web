function BackgroundEffect() {

	var BACKGROUND_COLOR = '#2E112D';

	var POINT_COLOR = 'rgba(201,34,54,0.66)';
	var LINE_COLOR = function(br, x) { return 'rgba(201,34,54,'+br+')'; }

	var c1 = document.getElementById('c1');

	var width = 100;
	var height = 100;
	var density = 1;

	var MAX_POINTS = 300;
	var targetnumpoints = MAX_POINTS;

	var pts = [];

	var SIMWIDTH = 1024;
	var SIMHEIGHT = 1024;

	var GS = 100;
	var QW = 1000;
	var MAXLINE = 130;

	var TIME = 0.0;

	function resize() {
		width = window.innerWidth;
		height = window.innerHeight;
		density = window.devicePixelRatio || 1;
		width *= density;
		height *= density;
		targetnumpoints = Math.ceil(width * height / 20000);
		if (targetnumpoints > MAX_POINTS)
			targetnumpoints = MAX_POINTS;
		c1.width = width;
		c1.height = height;
	}

	function rotate(p, a) {
		return {
			x: p.x * Math.sin(a) + p.y * Math.cos(a),
			y: p.x * Math.cos(a) - p.y * Math.sin(a),
		}
	}

	function project(p) {
		var z = Math.sqrt(p.x*p.x + p.y*p.y);
		var hw = width / 2.0;
		var hh = height / 2.0;
		var s = Math.max(width, height) / 2.0;
		s *= (1.0 + 0.1 * Math.sin(z / 100.0 + TIME * 1.5));
		var p2 = rotate(p, -TIME / 4.0);
		return {
			x: hw + s * p2.x / 1024.0, // * (0.5 + z),
			y: hh + s * p2.y / 1024.0, // * (0.5 + z),
		}
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
		this.x = -SIMWIDTH + Math.random() * 2 * SIMWIDTH;
		this.y = -SIMHEIGHT + Math.random() * 2 * SIMHEIGHT;
		this.qx = -10;
		this.qy = -10;
		this.qid = 0;
		var s = Math.random() * 1;
		s = s * s * s;
		s += 0.5;
		s *= 0.2;
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
		this.x += this.vx;
		this.y += this.vy;
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
			var df = dl / 100.0;
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

		if (this.x > SIMWIDTH) this.x = -SIMWIDTH;
		if (this.y > SIMHEIGHT) this.y = -SIMHEIGHT;
		if (this.x < -SIMWIDTH) this.x = SIMWIDTH;
		if (this.y < -SIMHEIGHT) this.y = SIMHEIGHT;

		this.qx = Math.floor((this.x + 0) / GS);
		this.qy = Math.floor((this.y + 0) / GS);
		this.qid = this.qy * QW + this.qx;
		this.tg = 0;
	}

	PT.prototype.render = function(ctx) {
		ctx.strokeStyle = POINT_COLOR;
		ctx.lineWidth = 1;
		var p = project(this);
		ctx.beginPath();
		ctx.moveTo(p.x, p.y);
		ctx.lineTo(p.x, p.y+density);
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

		ctx.fillStyle = BACKGROUND_COLOR;
		ctx.fillRect(0,0, width, height);

		for (var i=0; i<pts.length; i++) {
			var p = pts[i];
			p.update();
		}

		var lines = [];
		for (var j=0; j<pts.length; j++) {
			for (var i=0; i<pts.length; i++) {
				if (i == j) {
					continue;
				}

				var p1 = pts[i];
				var p2 = pts[j];
				if (p1.qx < (p2.qx - 1) || p1.qx > (p2.qx + 1) ||
					p1.qy < (p2.qy - 1) || p1.qy > (p2.qy + 1)) {
					continue;
				}

				var dx = p1.x - p2.x;
				var dy = p1.y - p2.y;
				var dl = Math.sqrt(dx * dx + dy * dy);
				if (dl > MAXLINE) {
					continue;
				}

				lines.push({
					a: project(p1),
					b: project(p2),
					d: dl
				});
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

			ctx.strokeStyle = LINE_COLOR(br, l.a.x);
			ctx.lineWidth = 2.0 + 10.0 * br;
			ctx.beginPath();
			ctx.moveTo(l.a.x, l.a.y);
			ctx.lineTo(l.b.x, l.b.y);
			ctx.stroke();
		});

		for (var i=0; i<pts.length; i++) {
			var p = pts[i];
			p.render(ctx);
		}

		TIME += 1.0 / 60.0;

		requestAnimationFrame(render);
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

