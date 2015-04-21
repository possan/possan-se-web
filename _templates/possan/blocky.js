(function(exports) {















	function expandFromBigMenu(evt, el) {
		console.log('expandFromBigMenu,', evt, el);

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

		setTimeout(function() {
			el2.style.opacity = 1.0;
		}, 50);

		setTimeout(function() {
			el2.style.left = '0px';
			el2.style.width = '100%';
		}, 400);

		setTimeout(function() {
			el2.style.top = '0px';
			el2.style.height =  document.body.offsetHeight + 'px';
		}, 700);

		setTimeout(function() {
			location = el.getAttribute('href', '');
		}, 1000);
	}

	function prepareArticle(article, delay) {

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

		article.addEventListener('click', function(event) {
			expandFromBigMenu(event, article);
			event.preventDefault();
			event.stopPropagation();
			return false;
		});
	}



	exports.addEventListener('load', function() {
		var list = document.querySelectorAll('section.articles a.article');
		if (list) for(var i=0; i<list.length; i++) {
			var e = list[i];
			console.log('article', e);
			prepareArticle(e, i * 150);
		}

	});



})(window);
