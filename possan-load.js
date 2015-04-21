//
//
//

var Loader = require('./tool/lib/loader.js').Loader;

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

var loader = new Loader(config);
console.log('Loading site content...');
loader.load().then(function() {
	console.log('Site content loaded.');
	loader.contentrepo.save('_temp/content.json');
});
