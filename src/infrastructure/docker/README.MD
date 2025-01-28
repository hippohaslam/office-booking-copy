# Docker

For local development, you can start dependent services run the following command to start the docker container:

```shell
docker compose -f docker-compose-local.yml up -d
```

To run the whole application, you can run the following command:

```shell
docker compose -f docker-compose-local.yml -f docker-compose-services.yml up -d
```

To stop the services, you can run the following command:

```shell
docker compose -f docker-compose-local.yml -f docker-compose-services.yml down
```

The CI makes use of docker-compose-services.yml and docker-compose-ci.yml to run the tests and build the application.

```shell
docker compose -f docker-compose-local.yml -f docker-compose-services.yml down
```
