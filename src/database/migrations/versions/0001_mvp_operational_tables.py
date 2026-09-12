"""Create the six PortFlow MVP operational tables."""
from alembic import op
from database.base import Base
from database import models  # noqa: F401

revision = "0001_mvp_operational_tables"
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    Base.metadata.create_all(op.get_bind())

def downgrade():
    Base.metadata.drop_all(op.get_bind())
