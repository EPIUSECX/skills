# Background Jobs

Frappe uses Python RQ (Redis Queue) for background job processing.

## Enqueue a job

```python
import frappe

frappe.enqueue(
    "myapp.tasks.send_report",      # dotted path to function
    queue="default",                  # short, default, long
    timeout=300,                      # seconds
    report_name="Monthly Summary"     # kwargs passed to function
)
```

The function must be importable, for example from `apps/myapp/myapp/tasks.py`.

## Queue types

| Queue | Use for | Default timeout |
|-------|---------|----------------|
| `short` | Quick tasks < 5 min | 300s |
| `default` | Normal tasks | 300s |
| `long` | Heavy tasks (exports, bulk ops) | 1500s |

## Enqueue options

```python
frappe.enqueue(
    method="myapp.tasks.process",
    queue="long",
    timeout=1500,
    now=False,               # True to run inline immediately (use this, not is_async=False)
    at_front=False,          # True to push to front of queue
    job_id="unique_id",      # an id; on its own it does not stop duplicates
    deduplicate=True,        # with job_id: skip if that job is queued or running
    enqueue_after_commit=True,  # only enqueue after DB commit
)
```

## Scheduled jobs

Define in `hooks.py`:
```python
# hooks.py
scheduler_events = {
    "daily": [
        "myapp.tasks.daily_cleanup"
    ],
    "hourly": [
        "myapp.tasks.sync_data"
    ],
    "cron": {
        "0 9 * * 1": [           # every Monday at 9 AM
            "myapp.tasks.weekly_report"
        ]
    }
}
```

Scheduler keys: `all` (every `scheduler_interval`, default 240 s, so every 4 min), `hourly`, `daily`, `weekly` (Sunday 00:00), `monthly`, `yearly`, `cron`, plus `hourly_long`, `daily_long`, `weekly_long`, `monthly_long`, `hourly_maintenance` and `daily_maintenance`. The `*_long` and `*_maintenance` jobs run on the `long` queue. All others, `cron` included, run on `default`.

## Checking job status

```python
from frappe.utils.background_jobs import get_jobs

jobs = get_jobs(site=frappe.local.site, queue="default")
```

## Common pitfalls

- Background jobs run in a separate worker process — they do NOT share state with the web request. Always pass data via arguments.
- `enqueue` has no `site` parameter. It records the current site and user, and the worker connects to that site before it calls the function. A `site=` argument is passed through to your function.
- `is_async=False` is deprecated outside tests and goes in v17. Use `now=True`.
- `frappe.utils.background_jobs.is_job_enqueued(job_id)` checks for a queued job.
- Use `enqueue_after_commit=True` when the job depends on data written in the current request.

## Document-context jobs

```python
frappe.enqueue_doc(
    "Expense",                      # doctype
    "EXP-0001",                     # name
    "send_notification",            # method name on the Document class
    queue="short",
    timeout=300,
    now=False,
)
```

`enqueue_doc` loads the document and calls `doc.send_notification()` in the worker. Preferred when the job logic is a method on the Document controller.
