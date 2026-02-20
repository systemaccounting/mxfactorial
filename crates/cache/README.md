<p align="center">
  <a href="https://www.systemaccounting.org/" target="_blank"><img width="475" alt="systemaccounting" src="https://user-images.githubusercontent.com/12200465/37568924-06f05d08-2a99-11e8-8891-60f373b33421.png"></a>
</p>

cache trait with redis and dynamodb implementations. stores rules, profiles, approvers, and accumulators

`cache::new()` factory returns the backend based on environment:
- **lambda** (`AWS_LAMBDA_FUNCTION_NAME` set): dynamodb
- **local** (`REDIS_HOST` set): redis
- **neither**: none

### usage

```rust
let cache = cache::new().await;
```

### trait methods

- `get_rules` / `set_rules` — transaction item and approval rules per account
- `get_profile` / `set_profile` — account profiles (role, geocode)
- `get_approvers` / `set_approvers` — approval accounts for transactions
- `get` / `set` / `del` — primitives for arbitrary key/value
- `smembers` / `sadd` / `srem` — set operations for threshold rule instances
- `lpush` / `brpoplpush` / `lrem` — list operations
- `incr_and_check_threshold` — atomic increment and threshold comparison for accumulator keys

### cache keys

`CacheKey` enum builds namespaced keys with optional date prefix from `CACHE_KEY_PREFIX`:

| variant | pattern |
|---|---|
| `Gdp` | `{prefix}:gdp:{geocode}` |
| `AccountProfile` | `account_profile:{account}` |
| `TransactionItemRuleInstance` | `transaction_item_rule_instance:{account}` |
| `ApprovalRuleInstance` | `approval_rule_instance:{account}` |
| `TransactionRuleInstanceThresholdProfit` | `transaction_rule_instance:threshold:profit:{account}` |
| `TransactionRuleInstanceAccumulator` | `transaction_rule_instance:{id}:accumulator` |

### implementations

**redis** (`src/redis.rs`) — uses fred client. `incr_and_check_threshold` runs a lua script for atomic increment + threshold comparison

**dynamodb** (`src/ddb.rs`) — uses aws sdk. composite key pattern (pk + sk) configurable via env vars. `incr_and_check_threshold` uses atomic ADD then conditional subtract

### dependencies

| env var | description |
|---|---|
| `REDIS_HOST` | redis host (local) |
| `REDIS_PORT` | redis port (default 6379) |
| `REDIS_PASSWORD` | redis password |
| `REDIS_USERNAME` | redis username (default "default") |
| `REDIS_DB` | redis database number (default 0) |
| `CACHE_KEY_PREFIX` | optional date prefix for gdp keys |
| `AWS_LAMBDA_FUNCTION_NAME` | triggers dynamodb backend |
| `DDB_TABLE_NAME` | dynamodb table name |
| `DDB_PK_NAME` | partition key attribute (default "pk") |
| `DDB_SK_NAME` | sort key attribute (default "sk") |
