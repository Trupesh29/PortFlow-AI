# Database Migrations

Run from `src/` after creating a PostgreSQL database:

```powershell
alembic -c database/alembic.ini upgrade head
alembic -c database/alembic.ini downgrade base
```

Revision `0001_mvp_operational_tables` owns only the six MVP tables. Application
startup never calls `create_all`.
