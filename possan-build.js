var Q = require('q');
var fs = require('fs');
var MarkdownProcessor = require('./tool/lib/markdownprocessor.js').MarkdownProcessor;
var pathmodule = require('path');
var Builder = require('./tool/lib/builder.js').Builder;
var TemplateDefinition = require('./_templates/possan/template.js').TemplateDefinition;

var config = {
	"contentfolders": [
		"_content/blogposts/**/*.md",
		"_content/projects/**/*.md",
		"_content/misc/**/*.md"
	],
	"staticfolders": [
		{
			"src": "_static/",
			"target": "static/"
		}
	],
	"cdn": [
		{
			"local": "static/",
			"server": "http://cloudfjont/"
		}
	],
	"templatefolder": "_templates/",
	"defaulttemplate": "possan",
	"outputfolder": "output/",
	"baseurl": "http://www.possan.se/",
	"cdnurl": "http://static.possan.se/",
	"imagetemplates": [
		{
			"id": "default",
			"mode": "fit"
		},
		{
			"id": "smallcover",
			"mode": "fill",
			"width": "300",
			"height": "150"
		},
		{
			"id": "smallcover2x",
			"mode": "fill",
			"width": "600",
			"height": "300"
		},
		{
			"id": "side",
			"mode": "fit",
			"maxwidth": "300"
		},
		{
			"id": "side2x",
			"mode": "fit",
			"maxwidth": "600"
		},
		{
			"id": "full",
			"mode": "fit",
			"maxwidth": "800"
		},
		{
			"id": "full2x",
			"mode": "fit",
			"maxwidth": "1600"
		}
	]
}

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
	var list = this.contentrepo.findAll('/posts/**');
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
	var list = this.contentrepo.findAll('/posts/'+year+'/**');
	list = this.sortByDate(list, false);
	return list;
}

Site.prototype.projectsByYear = function(year) {
	var list = this.contentrepo.findAll('/projects/'+year+'/**');
	list = this.sortByDate(list, false);
	return list;
}

Site.prototype.blogpostsByYearMonth = function(year,month) {
	var month2 = twodigit(month)
	var list = this.contentrepo.findAll('/posts/'+year+'/'+month2+'/**');
	list = this.sortByDate(list, false);
	return list;
}

Site.prototype.allProjects = function() {
	var list = this.contentrepo.findAll('/projects/**');
	return list;
}

Site.prototype.latestProjects = function() {
	var list = this.allProjects();
	list = this.sortByDate(list, true);
	return list;
}

Site.prototype.blogpostMonths = function(year) {
	var _this = this;
	var list = this.contentrepo.findAll('/posts/'+year+'/**');
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

Site.prototype._renderMarkdownToDocument = function(target_path, templatename, data) {
	console.log('Rendering markdown template document: ' + target_path);
	var _this = this;
	var future = Q.defer();

	data.local_url = target_path;

console.log('data', data);

	MarkdownProcessor.process(data.source_path, _this.contentrepo, _this.config, data.markdown).then(function(data2) {

console.log('data2', data2);

		data.html = data2.html; // TODO: fixa!
		var innerhtml = _this.templatecache.render(_this.config.defaulttemplate, templatename, data);
		data.innerhtml = innerhtml;
		var outerhtml = _this.templatecache.render(_this.config.defaulttemplate, 'layout', data);
		_this.outputrepo.addDocument(target_path, outerhtml);

// console.log('x');
		future.resolve();

	});

	return future.promise;
}

Site.prototype._renderToDocument = function(target_path, templatename, data) {
	console.log('Rendering template document: ' + target_path);
	var _this = this;
	var future = Q.defer();
	data.local_url = target_path;
	var innerhtml = _this.templatecache.render(_this.config.defaulttemplate, templatename, data);
	data.innerhtml = innerhtml;
	var outerhtml = _this.templatecache.render(_this.config.defaulttemplate, 'layout', data);
	this.outputrepo.addDocument(target_path, outerhtml);
	future.resolve();
	return future.promise;
}

Site.prototype.prepareIndex = function() {
	var _this = this;
	var proms = [];

	//
	// / - index
	//

	{
		var all_blogposts = this.allBlogposts();
		var all_projects = this.allProjects();
		var all = [].concat(all_blogposts).concat(all_projects);
		this.sortByDate(all, true);
		all = all.slice(0, 12);
		console.log('all', all[0]);
		proms.push(this._renderToDocument('/', 'index', {
			title: 'Hello!',
			latest: all
		}));
	}

	return proms;
}

Site.prototype.prepareProjects = function() {
	var _this = this;
	var proms = [];

	//
	// projects/ - all projects
	//

	{
		var outdoc = {
			title: 'Projects',
			lists: []
		};

		var all_years = this.projectYears();
		// console.log(all_years);
		all_years.forEach(function(year) {
			var projects = _this.projectsByYear(year);
			_this.sortByDate(projects, true);
			// console.log('all', all);

			var yearitems = projects.map(function(doc) {
				return {
					title: doc.title,
					link: doc.target_path,
					comment: doc.summary,
					coverthumb: doc.coverthumb,
					coverthumb2x: doc.coverthumb2x
				};
			});

			outdoc.lists.push({
				title: year,
				items: yearitems
			});

			proms.push(_this._renderToDocument('projects/'+year, 'thumblist', {
				title: year,
				lists: [{
					items: yearitems
				}]
			}));
		});

		// var innerhtml = _this.templatecache.render(_this.config.defaulttemplate, 'thumblist', outdoc);
		// outdoc.innerhtml = innerhtml;
		// var outerhtml = _this.templatecache.render(_this.config.defaulttemplate, 'layout', outdoc);
		// this.outputrepo.addDocument('projects', outerhtml);
		proms.push(this._renderToDocument('projects', 'thumblist', outdoc));
	}

	//
	// projects/[slug]
	//

	{
		var all_projects = this.latestProjects();
		// console.log(all_projects);
		all_projects.forEach(function(doc) {
			if (doc.written)
				return;

			doc.written = true;
			// doc.html = doc._html;
			// var outdoc = doc;
			// var innerhtml = _this.templatecache.render(_this.config.defaulttemplate, 'article', outdoc);
			// outdoc.innerhtml = innerhtml;
			// var outerhtml = _this.templatecache.render(_this.config.defaulttemplate, 'layout', outdoc);
			// _this.outputrepo.addDocument(doc.target_path, outerhtml);
			proms.push(_this._renderMarkdownToDocument(doc.target_path, 'article', doc));
			// doc.attachments.forEach(function(att) {
			// 	var dest2 = pathmodule.join(doc.target_path, att.filename);
			// 	console.log('Copying attachment', att.source, dest2);
			// 	_this.outputrepo.addStatic(att.source, dest2);
			// });
		});
	}

	return proms;
}

Site.prototype.preparePosts = function() {
	var _this = this;
	var proms = [];

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
			breadcrumbs: [
				// { link: 'yy', title: 'xyz', current: false },
				// { link: 'xx', title: 'www', current: true }
			]
		};
		// var innerhtml = _this.templatecache.render(_this.config.defaulttemplate, 'list', outdoc);
		// outdoc.innerhtml = innerhtml;
		// var outerhtml = _this.templatecache.render(_this.config.defaulttemplate, 'layout', outdoc);
		// this.outputrepo.addDocument('posts', outerhtml);
		proms.push(_this._renderToDocument('posts', 'list', outdoc));
	}

	//
	// blog/[yyyy] - list of blogpost during year
	// blog/[yyyy]/[mm] - list of blogposts during month in year
	//

	{
		var all_years = this.blogpostYears();
		all_years.forEach(function(year) {
			var year_posts = _this.blogpostsByYear(year);
			// console.log('year', year);
			year_posts = _this.sortByDate(year_posts, true);
			var outdoc = {
				title: 'Posts in ' + year,
				items: year_posts.map(function(doc) {
					return {
						title: doc.title,
						commentbefore: doc._day + ' ' + monthnames[doc._month - 1] + ': ',
						link: '/' + doc.target_path,
					};
				})
			};
			// var innerhtml = _this.templatecache.render(_this.config.defaulttemplate, 'list', outdoc);
			// outdoc.innerhtml = innerhtml;
			// var outerhtml = _this.templatecache.render(_this.config.defaulttemplate, 'layout', outdoc);
			// _this.outputrepo.addDocument('posts/' + year, outerhtml);
			proms.push(_this._renderToDocument('posts/' + year, 'list', outdoc));

			var monthstats = _this.blogpostMonths(year);
			monthstats.forEach(function(mon) {
			// console.log('mon', mon);
				var month_posts = _this.blogpostsByYearMonth(year, mon.month2);
				month_posts = _this.sortByDate(month_posts, true);
				var outdoc2 = {
					title: 'Posts in ' + monthnames[mon.month-1] + ' ' + year,
					items: month_posts.map(function(doc) {
						return {
							commentbefore: doc._day + ' ' + monthnames[doc._month - 1] + ': ',
							title: doc.title,
							link: doc.target_path,
						};
					})
				};
				// var innerhtml2 = _this.templatecache.render(_this.config.defaulttemplate, 'list', outdoc2);
				// outdoc2.innerhtml = innerhtml2;
				// var outerhtml2 = _this.templatecache.render(_this.config.defaulttemplate, 'layout', outdoc2);
				// _this.outputrepo.addDocument(, outerhtml2);
				proms.push(_this._renderToDocument('posts/' + year + '/' + mon.month2, 'list', outdoc2));
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
			// doc.html = doc._html;
			// console.log('Writing blogpost', doc);
			proms.push(_this._renderMarkdownToDocument(doc.target_path, 'article', doc));
			// var outdoc = doc;
			// var innerhtml = _this.templatecache.render(_this.config.defaulttemplate, 'article', outdoc);
			// outdoc.innerhtml = innerhtml;
			// var outerhtml = _this.templatecache.render(_this.config.defaulttemplate, 'layout', outdoc);
			// _this.outputrepo.addDocument(doc.target_path, outerhtml);
			// doc.attachments.forEach(function(att) {
			// 	var dest2 = pathmodule.join(doc.target_path, att.filename);
			// 	console.log('Copying attachment', att.source, dest2);
			// 	_this.outputrepo.addStatic(att.source, dest2);
			// });
		});
	}

	return proms;
}

Site.prototype.prepareRest = function() {
	var _this = this;
	var proms = [];

	//
	// write the rest of the content documents
	//

	{
		this.contentrepo.documents.forEach(function(doc) {
			if (doc.written)
				return;

			if (doc.target_path && doc.type == 'document') {
				doc.written = true;
				// doc.html = doc._html;
				// console.log('Unwritten doc', doc);
				// var outdoc = doc;
				// var innerhtml = _this.templatecache.render(_this.config.defaulttemplate, 'article', outdoc);
				// outdoc.innerhtml = innerhtml;
				// var outerhtml = _this.templatecache.render(_this.config.defaulttemplate, 'layout', outdoc);
				// _this.outputrepo.addDocument(doc.target_path, outerhtml);
				proms.push(_this._renderMarkdownToDocument(doc.target_path, 'article', doc));
			}
		});
	}

	{
		this.contentrepo.documents.forEach(function(doc) {
			if (doc.written)
				return;

			if (doc.target_path && doc.type == 'static') {
				doc.written = true;
				console.log('Unwritten static file: ' + doc.target_path);

				// var outdoc = doc;
				// var innerhtml = _this.templatecache.render(_this.config.defaulttemplate, 'article', outdoc);
				// outdoc.innerhtml = innerhtml;
				// var outerhtml = _this.templatecache.render(_this.config.defaulttemplate, 'layout', outdoc);
				// _this.outputrepo.addDocument(doc.target_path, outerhtml);
				_this.outputrepo.addStatic(doc.source_path, doc.target_path);
			}
		});
	}

	return proms;
}

Site.prototype.prepare = function() {
	var _this = this;
	var future = Q.defer();
	Q.allSettled(_this.prepareIndex()).then(function(statuses) {
		Q.allSettled(_this.preparePosts()).then(function(statuses) {
			Q.allSettled(_this.prepareProjects()).then(function(statuses) {
				Q.allSettled(_this.prepareRest()).then(function(statuses) {
					future.resolve();
				});
			});
		});
	});
	return future.promise;
}

var builder = new Builder(config, Site, TemplateDefinition);
console.log('Loading site content...');
builder.build('_temp/content.json').then(function() {
	console.log('Site built, saving structure.');
	builder.save('_temp/output.json');
	console.log('Site structure saved.');
});
