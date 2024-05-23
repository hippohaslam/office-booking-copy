# Docker

For local development, you can start dependent services run the following command to start the docker container:

```
docker compose -f docker-compose.yml up -d
```

To run the whole application, you can run the following command:

```
docker compose -f docker-compose.yml -f docker-compose-services.yml up -d
```


To stop the services, you can run the following command:

```
docker compose -f docker-compose.yml -f docker-compose-services.yml down 
```