# Testing

## File location

Tests live alongside the code they test:
```
apps/<app>/<app>/<module>/doctype/<doctype>/test_<doctype>.py
```

For feature-wise tests, place in the tests directory:
```
apps/<app>/<app>/tests/test_<feature>.py
```

## Writing tests

```python
import frappe
from frappe.tests import IntegrationTestCase

class TestExpense(IntegrationTestCase):
    def test_expense_creation(self):
        doc = frappe.get_doc(doctype="Expense", title="Test", amount=100)
        doc.insert()
        self.assertEqual(doc.amount, 100)

    def test_validation(self):
        doc = frappe.get_doc(doctype="Expense", title="Test", amount=-1)
        self.assertRaises(frappe.ValidationError, doc.insert)
```

Key patterns:
- Inherit from `frappe.tests.IntegrationTestCase` (not `unittest.TestCase`). `frappe.tests.utils.FrappeTestCase` still works but is deprecated and goes in v17.
- The database rolls back once per test **class**, not per test. A row inserted in one test is visible to the next tests in the same class.
- Anything the code under test commits (`frappe.db.commit()`, or DDL, which commits implicitly) stays in the site. So do test records, which are committed in `setUpClass`.
- Use the built-in helpers instead of hand-rolled patching: `self.set_user(...)`, `self.freeze_time(...)`, `self.change_settings(...)`, `self.patch_hooks(...)`, `self.assertQueryCount(...)`.

## Unit tests (no database)

For pure logic that doesn't need the database:

```python
from frappe.tests import UnitTestCase

class TestExpenseUtils(UnitTestCase):
    def test_calculate_tax(self):
        self.assertEqual(calculate_tax(100, 0.1), 10)
```

`UnitTestCase` is faster: it creates no test records and does not roll back. It still needs a Frappe context, and under `run-tests` the database is connected, so any write it makes stays. Use it for utility functions, calculations, parsing logic.

## Test fixtures

For test data that many tests need, use test records or `setUpClass`.

Test records load from `test_records.toml` in the DocType folder (`test_records.json` is the old format). Read them through `self.globalTestRecords["Expense Category"]`. `frappe.get_test_records` is deprecated. Declare extra or skipped dependencies with `EXTRA_TEST_RECORD_DEPENDENCIES` and `IGNORE_TEST_RECORD_DEPENDENCIES` (the old names were `test_dependencies` and `test_ignore`).

Do not insert named records in `setUp`. It runs before every test, nothing rolls back between tests, so the second insert fails with `DuplicateEntryError`:

```python
class TestExpense(IntegrationTestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        if not frappe.db.exists("Expense Category", "Travel"):
            frappe.get_doc(doctype="Expense Category", category_name="Travel").insert()
```

## Test site

Run tests on a **separate site** from the one the user is actively working on. Tests create, modify, and delete data — running them on the development site will pollute it.

Convention: if the dev site is `expense.localhost`, create `expense-test.localhost` for tests:
```bash
bench new-site expense-test.localhost --admin-password admin
bench --site expense-test.localhost install-app <app-name>
bench --site expense-test.localhost set-config allow_tests true
```

Without `allow_tests` (or the `CI` environment variable), `run-tests` prints "Testing is disabled for the site!" and exits with code 0. That looks like a pass.

Always run tests against the test site:
```bash
bench --site expense-test.localhost run-tests --app <app-name>
```

## Running tests

```bash
# All tests for an app
bench --site <site> run-tests --app <app-name>

# Specific DocType
bench --site <site> run-tests --doctype "Expense"

# Specific test file
bench --site <site> run-tests --module <app>.<module>.doctype.<doctype>.test_<doctype>

# Specific test method
bench --site <site> run-tests --module <app>.<module>.doctype.<doctype>.test_<doctype> --test test_expense_creation

# Only unit or only integration tests; stop at the first failure
bench --site <site> run-tests --app <app-name> --test-category unit --failfast
```

Without `--app`, `run-tests` runs the tests of every installed app, frappe included. Do not combine `--force` with `--doctype`: it deletes every row of that DocType first.

## Common pitfalls

- If tests fail with "DocType not found", run `bench --site <site> migrate` first.
- Test files must be named `test_*.py` to be discovered.
