var Q = require('q');
var fs = require('fs');
var wmd = require('wmd');
var path = require('path');
var glob = require('glob');
var htmlparser2 = require('htmlparser2');
var domser = require('dom-serializer');

var MarkdownLoader = function() {
}


MarkdownLoader.loadFile = function(filepath, contentrepo, config) {
	var future = Q.defer();

	console.log('Loading document: ' + filepath);

	var contentfolder = path.dirname(filepath);
	// console.log('Globbing contentfolder: ' + contentfolder);

	// function updateDomChildren(domchildren) {
	// 	domchildren.forEach(function(ch) {
	// 		updateDomNode(ch);
	// 	});
	// }

	// function updateDomNode(domnode) {
	// 	// console.log('updating dom node', domnode.type, domnode.name, domnode.attribs);

	// 	if (domnode.type == 'tag' && domnode.name == 'img') {
	// 		// console.log('found image', domnode);

	// 		var cls = domnode.attribs['class'] || '';

	// 		var src = domnode.attribs.src;
	// 		if (src.indexOf('://') == -1) {
	// 			if (cls.indexOf('side') != -1) {
	// 				var rr = contentrepo.addThumbnail(src, ['side', 'side2x'], contentfolder, d.metadata.path);
	// 				domnode.attribs.src = rr['side'];
	// 				domnode.attribs['data-highres'] = rr['side2x'];
	// 			} else {
	// 				var rr = contentrepo.addThumbnail(src, ['full', 'full2x'], contentfolder, d.metadata.path);
	// 				domnode.attribs['class'] = (cls + ' full').trim();
	// 				domnode.attribs.src = rr['full'];
	// 				domnode.attribs['data-highres'] = rr['full2x'];
	// 			}
	// 		}
	// 	}

	// 	if (domnode.children) {
	// 		updateDomChildren(domnode.children);
	// 	}
	// }


	glob(contentfolder + '/*', {}, function (er, files) {
		// var attachments = [];
		var markdownfile = '';

		var raw = fs.readFileSync(filepath, 'UTF-8');
		// console.log('got raw', raw.length);

		// parse markdown metadata
		var _d = wmd(raw, {});

		/*
		var handler = new htmlparser2.DomHandler(function (error, dom) {
			// console.log('domhandler', error, dom);
			updateDomChildren(dom);
			// console.log('updated dom', dom);
			var newhtml = domser(dom);
			// console.log('newhtml', newhtml);
			// console.log('newhtml', d.metadata);
		*/
		// var d = {};

		// contentfolder = ;
		var md = _d.markdown;
		var d = _d.metadata;
		d.source_path = filepath;
		d.target_path = d.path;
		d.markdown = md;
		d.subtype = 'markdown';
		//	d.html = newhtml;
		//	d.attachments = attachments;
		// d.contentfolder = contentfolder;
		// d._path = filepath;

		if (d.cover) {
			var tmp = contentrepo.addThumbnail(d.cover, ['smallcover', 'smallcover2x'], contentfolder, d.path);
			d.coverthumb = tmp['smallcover'];
			d.coverthumb2x = tmp['smallcover2x'];
		}

		delete(d.path);
		contentrepo.addDocument(d);

		// console.log('glob callback', files);
		files.forEach(function(f) {
			var ext = path.extname(f).toLowerCase();
			if (ext == '.md') {
				return;
			}
			var fn = path.basename(f);
			var st = fs.statSync(f);
			if (!st.isFile())
				return;
			console.log('File ' + filepath + ' has related file ' + f);
			// attachments.push({
			// 	source_path: f,
			// 	// filename: fn
			// 	target_path:
			// });
			contentrepo.addReference(f, d.target_path + '/' + fn);
		});

		// setTimeout(function() {
		future.resolve(true);
		// }, 50);
		/*
		});

		var parser2 = new htmlparser2.Parser(handler);
		parser2.write(d.html);
		parser2.done();
		*/
	});

	return future.promise;
}

exports.MarkdownLoader = MarkdownLoader;
