from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import bcrypt

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    is_admin = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    resources = db.relationship('Resource', backref='user', lazy=True, cascade='all, delete-orphan')
    help_requests = db.relationship('HelpRequest', backref='user', lazy=True, cascade='all, delete-orphan')
    shelters = db.relationship('Shelter', backref='user', lazy=True, cascade='all, delete-orphan')

    def set_password(self, password):
        self.password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    def check_password(self, password):
        return bcrypt.checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'is_admin': self.is_admin,
            'created_at': self.created_at.isoformat()
        }


class Resource(db.Model):
    __tablename__ = 'resources'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    contact_number = db.Column(db.String(20), nullable=False)
    resource_type = db.Column(db.String(50), nullable=False)  # water, food, medicine, shelter_space
    quantity = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    location_address = db.Column(db.String(255), nullable=False)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(20), default='available')  # available, allocated, exhausted
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'name': self.name,
            'contact_number': self.contact_number,
            'resource_type': self.resource_type,
            'quantity': self.quantity,
            'description': self.description,
            'location_address': self.location_address,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'status': self.status,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }


class HelpRequest(db.Model):
    __tablename__ = 'help_requests'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    contact_number = db.Column(db.String(20), nullable=False)
    help_type = db.Column(db.String(50), nullable=False)  # water, food, medical, rescue, shelter
    urgency = db.Column(db.String(20), nullable=False)  # critical, high, medium, low
    description = db.Column(db.Text, nullable=False)
    location_address = db.Column(db.String(255), nullable=False)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    people_affected = db.Column(db.Integer, nullable=False)
    status = db.Column(db.String(20), default='pending')  # pending, in_progress, fulfilled
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'name': self.name,
            'contact_number': self.contact_number,
            'help_type': self.help_type,
            'urgency': self.urgency,
            'description': self.description,
            'location_address': self.location_address,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'people_affected': self.people_affected,
            'status': self.status,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }


class Shelter(db.Model):
    __tablename__ = 'shelters'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    shelter_name = db.Column(db.String(150), nullable=False)
    contact_person = db.Column(db.String(100), nullable=False)
    contact_number = db.Column(db.String(20), nullable=False)
    location_address = db.Column(db.String(255), nullable=False)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    total_capacity = db.Column(db.Integer, nullable=False)
    current_occupancy = db.Column(db.Integer, default=0)
    has_food = db.Column(db.Boolean, default=False)
    has_water = db.Column(db.Boolean, default=False)
    has_medical = db.Column(db.Boolean, default=False)
    has_electricity = db.Column(db.Boolean, default=False)
    has_toilets = db.Column(db.Boolean, default=False)
    operational_status = db.Column(db.String(20), default='open')  # open, full, closed
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'shelter_name': self.shelter_name,
            'contact_person': self.contact_person,
            'contact_number': self.contact_number,
            'location_address': self.location_address,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'total_capacity': self.total_capacity,
            'current_occupancy': self.current_occupancy,
            'has_food': self.has_food,
            'has_water': self.has_water,
            'has_medical': self.has_medical,
            'has_electricity': self.has_electricity,
            'has_toilets': self.has_toilets,
            'operational_status': self.operational_status,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
