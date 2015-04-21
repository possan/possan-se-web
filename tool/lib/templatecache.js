var fs = require('fs');
var pathmodule = require('path');
var hogan = require('hogan.js');

var TemplateCache = function(config, outputrepo, templatedef) {
	this.outputrepo = outputrepo;
	this.config = config;
	this.templatecache = {};
	this.templatedef = templatedef;
	this.templateinstance = null;
}

TemplateCache.prototype.loadTemplate = function(templatename) {
	var _this = this;

	// if (typeof(this.templatedefinitioncache[templatename]) != 'undefined') {
	// 	return this.templatedefinitioncache[templatename];
	// }

	// var templateDef = this.templatedef;
	// console.log('loadTemplate', templatename, templateDef);
	// try {
	// 	var fn = this.config.templatefolder+'/'+templatename+'/template';
	// 	console.log('Loading template definition from: ' + fn);
	// 	templateDef = require(fn).TemplateDefinition;
	// } catch(e) {
	// 	console.error(e);
	// 	this.templatedefinitioncache[templatename] = null;
	// 	return null;
	// }

	if (this.templateinstance == null) {
		this.templateinstance = this.templatedef;
		this.templateinstance.path = this.config.templatefolder + '/' + templatename;
		this.templateinstance.staticFiles.forEach(function(stat) {
			console.log('Adding static template resource: ' + stat);
			_this.outputrepo.addStatic(_this.templateinstance.path + '/' + stat, '/' + stat);
		});

		// this.templatedefinitioncache[templatename] = templateDef;
	// } else {
	// 	console.error('Failed to load template: ' + templatename);
	}

	return this.templateinstance;//efinitioncache[templatename];
}

TemplateCache.prototype.render = function(templatename, templatefilename, doc) {
	var t = this.loadTemplate(templatename)
	if (!t) {
		return 'Template not found: ' + templatename + '/' + templatefilename;
	}

	var tid = templatename+'/'+templatefilename;
	if (typeof(this.templatecache[tid]) == 'undefined') {

		var tfn = pathmodule.join(t.path, templatefilename + '.html');
		console.log('Caching template ' + tfn);

		var traw = fs.readFileSync(t.path + '/' + templatefilename + '.html', 'UTF-8');
		// console.log('Loaded ' + traw);

		var template = hogan.compile(traw);
		// console.log('template', template);

		this.templatecache[tid] = template;
	}

	var html = this.templatecache[tid].render(doc);
	// console.log('Generated: ', html);

	return html;
}

exports.TemplateCache = TemplateCache;
