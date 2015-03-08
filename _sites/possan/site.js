var Q = require('q');

function twodigit(n) {
	var ret = '' + n;
	if (ret.length < 2)
		ret = '0' + ret;
	return ret;
}

var monthnames = [
	'January',
	'February',
	'March',
	'April',
	'May',
	'June',
	'July',
	'August',
	'September',
	'October',
	'November',
	'December'
];

var Site = function(config, contentrepo, templatecache, outputrepo) {
	this.config = config;
	this.contentrepo = contentrepo;
	this.templatecache = templatecache;
	this.outputrepo = outputrepo;
}

Site.prototype.sortByDate = function(list, reverse) {
	list.sort(function(a,b) {
		if (b._timestamp < a._timestamp)
			return reverse ? -1 : 1;
		else if (b._timestamp > a._timestamp)
			return reverse ? 1 : -1;
		return 0;
	});
	return list;
}

Site.prototype.allBlogposts = function() {
	var list = this.contentrepo.findAll('posts/**');
	return list;
}

Site.prototype.latestBlogposts = function() {
	var list = this.allBlogposts();
	list = this.sortByDate(list, true);
	return list;
}

Site.prototype.blogpostYears = function() {
	var list = this.allBlogposts();
	list = this.sortByDate(list, true);
	var years = [];
	list.forEach(function(doc) {
		if (years.indexOf(doc._year) == -1)
			years.push(doc._year);
	});
	return years;
}

Site.prototype.projectYears = function() {
	var list = this.allProjects();
	list = this.sortByDate(list, true);
	var years = [];
	list.forEach(function(doc) {
		if (years.indexOf(doc._year) == -1)
			years.push(doc._year);
	});
	return years;
}

Site.prototype.blogpostsByYear = function(year) {
	var list = this.contentrepo.findAll('posts/'+year+'/**');
	list = this.sortByDate(list, false);
	return list;
}

Site.prototype.projectsByYear = function(year) {
	var list = this.contentrepo.findAll('projects/'+year+'/**');
	list = this.sortByDate(list, false);
	return list;
}

Site.prototype.blogpostsByYearMonth = function(year,month) {
	var month2 = twodigit(month)
	var list = this.contentrepo.findAll('posts/'+year+'/'+month2+'/**');
	list = this.sortByDate(list, false);
	return list;
}

Site.prototype.allProjects = function() {
	var list = this.contentrepo.findAll('projects/**');
	return list;
}

Site.prototype.latestProjects = function() {
	var list = this.allProjects();
	list = this.sortByDate(list, true);
	return list;
}

Site.prototype.blogpostMonths = function(year) {
	var _this = this;
	var list = this.contentrepo.findAll('posts/'+year+'/**');
	list = this.sortByDate(list, false);
	var months = [];
	var ret = [];
	list.forEach(function(doc) {
		if (months.indexOf(doc._month) != -1)
			return;
		months.push(doc._month);
		ret.push({
			month: doc._month,
			month2: twodigit(doc._month),
			count: _this.blogpostsByYearMonth(year, twodigit(doc._month)).length
		});
	});
	return ret;
}

Site.prototype.prepareIndex = function() {
	var _this = this;

	//
	// / - index
	//

	{
		var all_blogposts = this.allBlogposts();
		var all_projects = this.allProjects();
		var all = [].concat(all_blogposts).concat(all_projects);
		this.sortByDate(all, true);
		all = all.slice(0, 12);
		// console.log('all', all);
		var outdoc = {
			title: 'Hello!',
			latest: all
		};
		var innerhtml = _this.templatecache.render(_this.config.defaulttemplate, 'index', outdoc);
		outdoc.innerhtml = innerhtml;
		var outerhtml = _this.templatecache.render(_this.config.defaulttemplate, 'layout', outdoc);
		this.outputrepo.addDocument('/', outerhtml);
	}
}

Site.prototype.prepareProjects = function() {
	var _this = this;

	//
	// projects/ - all projects
	//

	{
		var outdoc = {
			title: 'Projects',
			lists: []
		};

		var all_years = this.projectYears();
		all_years.forEach(function(year) {
			var projects = _this.projectsByYear(year);

			_this.sortByDate(projects, true);
			// console.log('all', all);
			var outdoc2 = {
				title: year,
				items: projects.map(function(doc) {
					return {
						title: doc.title,
						link: '/' + doc.path,
						comment: doc.summary
						// # doc._day + ' ' + monthnames[doc._month - 1],
					};
				})
			};

			outdoc.lists.push(outdoc2);
		});

		var innerhtml = _this.templatecache.render(_this.config.defaulttemplate, 'list', outdoc);
		outdoc.innerhtml = innerhtml;
		var outerhtml = _this.templatecache.render(_this.config.defaulttemplate, 'layout', outdoc);
		this.outputrepo.addDocument('projects', outerhtml);
	}

	//
	// projects/[slug]
	//

	{
		var all_projects = this.latestProjects();
		all_projects.forEach(function(doc) {
			if (doc.written)
				return;

			doc.written = true;
			var outdoc = doc;
			var innerhtml = _this.templatecache.render(_this.config.defaulttemplate, 'article', outdoc);
			outdoc.innerhtml = innerhtml;
			var outerhtml = _this.templatecache.render(_this.config.defaulttemplate, 'layout', outdoc);
			_this.outputrepo.addDocument(doc.path, outerhtml);
		});
	}
}

Site.prototype.preparePosts = function() {
	var _this = this;

	//
	// posts/ - latest blogposts
	//

	{
		var all_blogposts = this.latestBlogposts();
		var outerlists = this.blogpostYears().map(function(year) {
			return {
				title: year,
				link: '/posts/'+year,
				items: _this.blogpostMonths(year).map(function(mon) {
					return {
						title: monthnames[mon.month - 1],
						link: '/posts/' + year + '/' + twodigit(mon.month),
						comment: '(' + mon.count + ')'
					}
				})
			};
		});

		all_blogposts = all_blogposts.slice(0,20);
		var outdoc = {
			title: 'Latest posts',
			lists: outerlists,
			list: all_blogposts,
			years: all_years,
		};
		var innerhtml = _this.templatecache.render(_this.config.defaulttemplate, 'list', outdoc);
		outdoc.innerhtml = innerhtml;
		var outerhtml = _this.templatecache.render(_this.config.defaulttemplate, 'layout', outdoc);
		this.outputrepo.addDocument('posts', outerhtml);
	}

	//
	// blog/[yyyy] - list of blogpost during year
	// blog/[yyyy]/[mm] - list of blogposts during month in year
	//

	{
		var all_years = this.blogpostYears();
		all_years.forEach(function(year) {
			var year_posts = _this.blogpostsByYear(year);
			year_posts = _this.sortByDate(year_posts, true);
			var outdoc = {
				title: 'Posts in ' + year,
				items: year_posts.map(function(doc) {
					return {
						title: doc.title,
						commentbefore: doc._day + ' ' + monthnames[doc._month - 1] + ': ',
						link: '/' + doc.path,
					};
				})
			};
			var innerhtml = _this.templatecache.render(_this.config.defaulttemplate, 'list', outdoc);
			outdoc.innerhtml = innerhtml;
			var outerhtml = _this.templatecache.render(_this.config.defaulttemplate, 'layout', outdoc);
			_this.outputrepo.addDocument('posts/' + year, outerhtml);


			var monthstats = _this.blogpostMonths(year);
			monthstats.forEach(function(mon) {
				var month_posts = _this.blogpostsByYearMonth(year, mon.month2);
				month_posts = _this.sortByDate(month_posts, true);
				var outdoc2 = {
					title: 'Posts in ' + monthnames[mon.month-1] + ' ' + year,
					items: month_posts.map(function(doc) {
						return {
							commentbefore: doc._day + ' ' + monthnames[doc._month - 1] + ': ',
							title: doc.title,
							link: '/' + doc.path,
						};
					})
				};
				var innerhtml2 = _this.templatecache.render(_this.config.defaulttemplate, 'list', outdoc2);
				outdoc2.innerhtml = innerhtml2;
				var outerhtml2 = _this.templatecache.render(_this.config.defaulttemplate, 'layout', outdoc2);
				_this.outputrepo.addDocument('posts/' + year + '/' + mon.month2, outerhtml2);
			});
		});
	}

	//
	// blog/[yyyy]/[mm]/[slug] - blogpost
	//

	{
		var all_blogposts = this.allBlogposts();
		all_blogposts.forEach(function(doc) {
			if (doc.written)
				return;

			doc.written = true;

			// console.log('doc', doc);
			var outdoc = doc;
			var innerhtml = _this.templatecache.render(_this.config.defaulttemplate, 'article', outdoc);
			outdoc.innerhtml = innerhtml;
			var outerhtml = _this.templatecache.render(_this.config.defaulttemplate, 'layout', outdoc);
			_this.outputrepo.addDocument(doc.path, outerhtml);
		});
	}
}

Site.prototype.prepareRest = function() {
	var _this = this;

	//
	// write the rest of the content documents
	//

	{
		this.contentrepo.documents.forEach(function(doc) {
			if (doc.written)
				return;

			doc.written = true;
			// console.log('unwritten doc', doc);
			if (doc.path) {
				var outdoc = doc;
				var innerhtml = _this.templatecache.render(_this.config.defaulttemplate, 'article', outdoc);
				outdoc.innerhtml = innerhtml;
				var outerhtml = _this.templatecache.render(_this.config.defaulttemplate, 'layout', outdoc);
				_this.outputrepo.addDocument(doc.path, outerhtml);
			}
		});
	}
}

Site.prototype.prepare = function() {
	var future = Q.defer();
	this.prepareIndex();
	this.preparePosts();
	this.prepareProjects();
	this.prepareRest();
	future.resolve();
	return future.promise;
}


exports.Site = Site;
