from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass

from app.modules.auth.models import User