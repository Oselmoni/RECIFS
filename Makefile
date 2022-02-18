generate-selfsigned-ssl:
	cd cert && docker-compose up

run-local:
	docker-compose build --parallel --pull
	docker-compose up --remove-orphans
