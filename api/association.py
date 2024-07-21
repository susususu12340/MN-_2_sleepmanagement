from sqlalchemy import Table, Column, Integer, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from api.database import SessionLocal, engine, Base

association_table = Table(
    'association',
    Base.metadata,
    Column('users_InGroupDB_id', Integer, ForeignKey('users_InGroupDB.id')),
    Column('group_id', Integer, ForeignKey('groups.id'))
)