var fs = require('fs');
var hogan = require('hogan.js');

var TemplateCache = function(config, outputrepo) {
	this.outputrepo = outputrepo;
	this.config = config;
	this.templatecache = {};
	this.templatedefinitioncache = {};
}

TemplateCache.prototype.loadTemplate = function(templatename) {
	var _this = this;

	if (typeof(this.templatedefinitioncache[templatename]) != 'undefined') {
		return this.templatedefinitioncache[templatename];
	}

	var templateDef = null;
	try {
		var fn = '../' + this.config.templatefolder+'/'+templatename+'/template';
		console.log('Loading template definition from: ' + fn);
		templateDef = require(fn).TemplateDefinition;
	} catch(e) {
		console.error(e);
		this.templatedefinitioncache[templatename] = null;
		return null;
	}

	if (templateDef) {
		templateDef.path = this.config.templatefolder + '/' + templatename;
		templateDef.staticFiles.forEach(function(stat) {
			console.log('Got static file: ' + stat);
			_this.outputrepo.addStatic(templateDef.path + '/' + stat, '/' + stat);
		});
		this.templatedefinitioncache[templatename] = templateDef;
	} else {
		console.error('Failed to load template: ' + templatename);
	}

	return this.templatedefinitioncache[templatename];
}

TemplateCache.prototype.render = function(templatename, templatefilename, doc) {
	var t = this.loadTemplate(templatename)
	if (!t) {
		return 'Template not found: ' + templatename + '/' + templatefilename;
	}

	var tid = templatename+'/'+templatefilename;
	if (typeof(this.templatecache[tid]) == 'undefined') {
		var tfn = t.path + '/' + templatefilename + '.html';
		console.log('Loading ' + tfn);

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