copy:
	rm -f src/*
	mkdir -p src
	#cp -R ../output/* src/
	cp -R ../temppage/dist/* src/

build: copy
	docker build -t eu.gcr.io/possan-misc/possan-www:latest .

upload: build
	docker push eu.gcr.io/possan-misc/possan-www:latest



