# Caching

`frappe.cache` is a Redis wrapper that prefixes keys with the site's `db_name` (`<db_name>|key`). `user=True` scopes a key to the session user, and `shared=True` shares it across sites without a prefix. `frappe.cache()` with parentheses is an old compatibility form.

## Basic operations

```python
# Set with TTL (preferred for ephemeral state)
frappe.cache.set_value("presence:user1", {"status": "online"}, expires_in_sec=300)

# Set without TTL (persistent until cleared)
frappe.cache.set_value("config:feature_flags", {"beta": True})

# Get
value = frappe.cache.get_value("presence:user1")

# Delete
frappe.cache.delete_value("presence:user1")

# Delete multiple
frappe.cache.delete_value(["key1", "key2"])
```

## Key patterns

Pass logical keys (e.g. `presence:user1`). The wrapper handles site-prefixing automatically. Do NOT manually prefix with database name.

## Listing keys

```python
# Get keys matching a prefix
keys = frappe.cache.get_keys("presence:")

# Count active keys
count = len(frappe.cache.get_keys("presence:"))
```

`get_keys` returns raw Redis keys (with site prefix). Do NOT compare directly to unprefixed logical keys. It uses the Redis `KEYS` command, which scans every key and blocks the shared Redis. Do not call it on a hot path. Keep a hash or a set (`hset`/`hkeys`, `sadd`/`smembers`) for things you count often.

## Reads, writes and transactions

- `get_value` keeps a copy in `frappe.local.cache` for the rest of the request or job. In a long job, pass `expires=True` to see a TTL expire.
- Cache writes are immediate. A database rollback does not undo them.

## Decorators and cached documents

```python
from frappe.utils.caching import redis_cache, request_cache, site_cache

@redis_cache(ttl=3600)        # shared across workers; clear with fn.clear_cache()
def expensive(): ...

@request_cache                # one request only
def per_request(): ...

doc = frappe.get_cached_doc("Company", name)                   # 1 hour TTL
value = frappe.get_cached_value("Company", name, "default_currency")
```

`@site_cache` lives in each worker's memory, so it grows with every key. Use it only for small, stable data.

## When to use cache

- **Session/presence data** — TTL-backed, short-lived
- **Expensive computed values** — cache with TTL to avoid recomputation
- **Cross-request coordination** — flags, locks, counters

Do not cache large objects. Redis is not a blob store.
