<p align="center">
  <img width="475" alt="systemaccounting" src="https://user-images.githubusercontent.com/12200465/37568924-06f05d08-2a99-11e8-8891-60f373b33421.png">
</p>

### warm-cache

populates cache with data from postgres for service layer caching

### cache backends
1. redis for local development
1. dynamodb for lambda

### cached data
1. state transaction item rules - rules matched by state (eg sales tax)
1. approval rules - rules matched by account name
1. account profiles - full profile json by account name
1. profile ids - profile id by account name
1. account approvers - owner accounts by owned account

### files
1. `bootstrap` - lambda runtime entrypoint
1. `function.sh` - lambda handler wrapper
1. `warm-cache.sh` - cache warming script

### local usage
```
make warm-cache
```

### docker usage
```
docker compose -f docker/storage.yaml up warm-cache
```

### lambda
invoked by `.github/workflows/warm-cache.yaml` after rds migrations
