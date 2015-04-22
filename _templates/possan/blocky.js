(function(exports) {













	var last_transition;

	function expandFromPage(callback) {
		console.log('expandFromPage');

		if (last_transition != null) {
			last_transition.parentNode.removeChild(last_transition);
		}

		// console.log(el.offsetLeft);
		// console.log(el.offsetTop);
		// console.log(el.offsetWidth);
		// console.log(el.offsetHeight);

		var el2 = document.createElement('div');
		el2.className = 'transition';
		el2.style.left = '0px';
		el2.style.top = '0px';
		el2.style.width = '100%';
		el2.style.height = '0px';
		document.body.appendChild(el2);

		last_transition = el2;

		setTimeout(function() {
			el2.style.opacity = 1.0;
		}, 50);

		setTimeout(function() {
			el2.style.height = '100%';
		}, 400);

		setTimeout(function() {
			callback();
		}, 500);
	}

	function expandFromBigMenu(evt, el, callback) {
		console.log('expandFromBigMenu,', evt, el);

		if (last_transition != null) {
			last_transition.parentNode.removeChild(last_transition);
		}

		// console.log(el.offsetLeft);
		// console.log(el.offsetTop);
		// console.log(el.offsetWidth);
		// console.log(el.offsetHeight);

		var el2 = document.createElement('div');
		el2.className = 'transition';
		el2.style.left = el.offsetLeft+'px';
		el2.style.top = el.offsetTop+'px';
		el2.style.width = el.offsetWidth+'px';
		el2.style.height = el.offsetHeight+'px';
		document.body.appendChild(el2);

		last_transition = el2;

		setTimeout(function() {
			el2.style.opacity = 1.0;
		}, 50);

		setTimeout(function() {
			el2.style.left = '0px';
			el2.style.width = '100%';
		}, 400);

		setTimeout(function() {
			el2.style.top = '0px';
			el2.style.height = '100%';
		}, 700);

		setTimeout(function() {
			callback();
		}, 1000);
	}

	function prepareArticle(article) {

		var images = article.querySelectorAll('img');
		if (images.length == 0)
			return;

		var url = images[0].getAttribute('src', '');
		// var url = article.dataset.cover || "http://lorempixel.com/" + Math.floor(400 + Math.random() * 10) + "/" + Math.floor(250 + Math.random() * 10) + "/";

		var newimg = document.createElement('div');
		newimg.className = 'delayed';
		// <div style="background-image:url()" class="delayed"></div>
		article.appendChild(newimg);

		var i = new Image();
		i.src = url;
		i.onload = function() {
			newimg.style.backgroundImage = "url('" + url + "')";

			setTimeout(function() {
				// article.classList.add('c'+Math.floor(1 + Math.random() * 7));

				newimg.classList.add('visible');
			}, 50 + delay);
		}
	}

	function appendNewPageHTML(html) {
		var el = document.createElement('div');
		el.className = 'pagewrapper';
		el.innerHTML = html;
		prepareLinksInElement(el);

		var old = [];
		var root = document.getElementById('pagestack');

		for(var i=0; i<root.childNodes.length; i++) {
			old.push(root.childNodes[i]);
		}

		root.appendChild(el);

		return old;
	}

	function fadeInNewPage(callback) {
		setTimeout(function() {
			if (last_transition != null) {
				last_transition.style.opacity = 0.0;
			}
			// el2.style.top = '100%';
			// el2.style.height =  '100%';
		}, 1);

		setTimeout(function() {
			if (last_transition != null) {
				last_transition.parentNode.removeChild(last_transition);
			}
			last_transition = null;
			callback();
		}, 1000);
	}

	function removeOldPages(old) {
		console.log('removing old pages', old);
		for(var i=0; i<old.length; i++) {
			old[i].parentNode.removeChild(old[i]);
		}
	}

	function preloadNextPageHTML(url, callback) {
		var request = new XMLHttpRequest();
		request.open('GET', url, true);

		request.onload = function() {
			if (request.status >= 200 && request.status < 400) {
				// Success!
				var html = request.responseText;
				var m1 = html.indexOf('<!--MARK1-->');
				var m2 = html.indexOf('<!--MARK2-->');
				if (m1 != -1 && m2 != -1) {

					html = html.substring(m1 + 12 , (m2 - m1) - 12);
					callback(html);
				} else {
					callback('');
				}
			} else {
				// We reached our target server, but it returned an error
				callback('');
			}
		};

		request.onerror = function() {
			// There was a connection error of some sort
			callback('');
		};

		request.send();
	}

	function prepareBoxZoomTransition(link) {
		link.addEventListener('click', function(event) {
			event.preventDefault();
			event.stopPropagation();

			var url = link.getAttribute('href', '');
			var old = [];

			history.pushState({ }, document.title, link);

			preloadNextPageHTML(url, function(html) {
				console.log('new html', html);
				old = appendNewPageHTML(html);
			});

			expandFromBigMenu(event, link, function() {
				// location = el.getAttribute('href', '');
				removeOldPages(old);
				// TODO: wait for both...
				fadeInNewPage(function() {

				});
			});

			return false;
		});
	}


	function prepareLinksInElement(parent) {
		var d = 0;
		var list = parent.querySelectorAll('a');
		if (list) for(var i=0; i<list.length; i++) {
			var e = list[i];
			console.log('found link', e.dataset.linktransition);

			if (e.dataset.linktransition ) {
				if (e.dataset.linktransition == 'boxzoom') {
					// prepareArticle(e);
					prepareBoxZoomTransition(e);
				} else {
					// prepareArticle(e);
					prepareBoxZoomTransition(e);
				}
			}
		}
	}

	function beginFullPageTransitionTo(url) {
		var old = [];
		// history.pushState({ }, document.title, url);

		preloadNextPageHTML(url, function(html) {
			console.log('new html', html);
			old = appendNewPageHTML(html);
		});

		expandFromPage(function() {
			removeOldPages(old);

			// TODO: wait for both...
			fadeInNewPage(function() {
			});
		});
	}


	exports.addEventListener('load', function() {
		prepareLinksInElement(document);

		window.onpopstate = function(event) {
			console.log("onpopstate location: " + document.location + ", state: " + JSON.stringify(event.state));

			console.log(document.location.pathname);
			beginFullPageTransitionTo(document.location.pathname);
		};
	});

})(window);
