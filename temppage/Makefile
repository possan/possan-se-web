all: distmisc dist/index.html dist/avatar2.gif

clean:
	rm -f dist/*
	rm -f tmp/*

install:
	npm install -g uglify-js less browserify

dist/style.min.css: src/style.less
	lessc src/style.less >dist/style.min.css

tmp/main.js: src/main.js src/*.js
	browserify src/main.js >tmp/main.js

dist/main.min.js: tmp/main.js
	uglifyjs tmp/main.js >dist/main.min.js

dist/index.html: dist/main.min.js dist/style.min.css src/index.tmpl.html buildtemplate.js
	node buildtemplate.js >dist/index.html

distmisc:
	mkdir -p dist tmp
	cp src/*webmanifest dist/
	cp src/*gif dist/
	cp src/*png dist/
	cp src/*svg dist/

# dist/avatar.png: src/avatar.png
# 	cp src/avatar.png dist/avatar.png
# 	optipng -o7 dist/avatar.png
