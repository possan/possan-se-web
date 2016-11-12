function Lieks() {

	var list = [
		'javascript',
		'webgl',
		'demoscene',
		'webvr',
		'chip music',
		'webaudio',
		'doom',
		'dub techno',
		'html5',
		'c/c++',
		'shaders',
		'sequencers',
		'synthesizers',
		'diy',
		'photography',
		'makers',
		'open standards',
		'public apis',
		'electronics',
		'arduino',
		'retro computing',
		'retrowave',
		'visualizations',
		'hacking',
		'electronics',
		'open hardware',
		'makefiles',
		'git'
	];

	var listposition = 0;

	var initialtitle = document.title;

	for(var i=0; i<10; i++) {
		list.sort(function() { return (Math.random() < 0.5) ? -1 : 1; });
	}

	// console.log('list', list);

	var el = document.getElementById('liek');

	var l1 = document.createElement('span');
	l1.className = 'fadein';
	el.appendChild(l1);

	var state = 'start';

	function tick() {
		console.log('tick', state);

		switch(state) {
			case 'start':
				l1.innerText = '❤︎ ' + list[listposition];
				l1.className = 'fadein';
				state = 'fading-in';
				queueTick(25);
				break;

			case 'fading-in':
				l1.className = 'fadein active';
				document.title = initialtitle + ' ' + l1.innerText;
				state = 'fade-out';
				queueTick(1500);
				break;

			case 'fade-out':
				l1.className = 'fadeout';
				state = 'fading-out';
				queueTick(25);
				break;

			case 'fading-out':
				l1.className = 'fadeout active';
				listposition ++;
				listposition %= list.length;
				state = 'start';
				queueTick(400);
				break;
		}
	}

	function queueTick(timeout) {
		setTimeout(tick.bind(this), timeout);
	}

	queueTick(1000);
};

// window.addEventListener('load', init);
module.exports = Lieks;
