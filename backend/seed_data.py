"""
Sample data script to populate the database with test data.
Run this script after setting up the database to add sample users, resources, help requests, and shelters.
"""

from dotenv import load_dotenv

# Load environment variables first
load_dotenv()

from app import create_app
from models import db, User, Resource, HelpRequest, Shelter

def seed_database():
    app = create_app()

    with app.app_context():
        # Clear existing data
        print("Clearing existing data...")
        db.drop_all()
        db.create_all()

        # Create sample users
        print("Creating sample users...")

        # Admin user
        admin = User(
            username='admin',
            email='admin@relaynest.com',
            is_admin=True
        )
        admin.set_password('admin123')
        db.session.add(admin)

        # Regular users
        user1 = User(
            username='john_doe',
            email='john@example.com',
            is_admin=False
        )
        user1.set_password('password123')
        db.session.add(user1)

        user2 = User(
            username='jane_smith',
            email='jane@example.com',
            is_admin=False
        )
        user2.set_password('password123')
        db.session.add(user2)

        user3 = User(
            username='relief_worker',
            email='relief@example.com',
            is_admin=False
        )
        user3.set_password('password123')
        db.session.add(user3)

        db.session.commit()
        print(f"Created {User.query.count()} users")

        # Create sample resources (Delhi locations)
        print("Creating sample resources...")
        resources_data = [
            {
                'user_id': user1.id,
                'name': 'Rajesh Kumar',
                'contact_number': '+91-9876543210',
                'resource_type': 'water',
                'quantity': '500 liters',
                'description': 'Clean drinking water in sealed containers',
                'location_address': 'Connaught Place, New Delhi, Delhi 110001, India',
                'latitude': 28.6315,
                'longitude': 77.2167,
                'status': 'available'
            },
            {
                'user_id': user2.id,
                'name': 'Priya Sharma',
                'contact_number': '+91-9876543211',
                'resource_type': 'food',
                'quantity': '200 meal packets',
                'description': 'Packaged meals ready to distribute',
                'location_address': 'Karol Bagh, New Delhi, Delhi 110005, India',
                'latitude': 28.6519,
                'longitude': 77.1900,
                'status': 'available'
            },
            {
                'user_id': user1.id,
                'name': 'Medical Store Delhi',
                'contact_number': '+91-9876543212',
                'resource_type': 'medicine',
                'quantity': '100 first aid kits',
                'description': 'Complete first aid kits with essential medicines',
                'location_address': 'Chandni Chowk, New Delhi, Delhi 110006, India',
                'latitude': 28.6506,
                'longitude': 77.2303,
                'status': 'available'
            },
            {
                'user_id': user3.id,
                'name': 'Community Center',
                'contact_number': '+91-9876543213',
                'resource_type': 'shelter_space',
                'quantity': '50 beds',
                'description': 'Temporary shelter space with bedding',
                'location_address': 'Saket, New Delhi, Delhi 110017, India',
                'latitude': 28.5244,
                'longitude': 77.2066,
                'status': 'available'
            },
            {
                'user_id': user2.id,
                'name': 'NGO Food Bank',
                'contact_number': '+91-9876543214',
                'resource_type': 'food',
                'quantity': '1000 kg dry rations',
                'description': 'Rice, wheat, dal and other essentials',
                'location_address': 'Dwarka, New Delhi, Delhi 110075, India',
                'latitude': 28.5921,
                'longitude': 77.0460,
                'status': 'available'
            }
        ]

        for data in resources_data:
            resource = Resource(**data)
            db.session.add(resource)

        db.session.commit()
        print(f"Created {Resource.query.count()} resources")

        # Create sample help requests
        print("Creating sample help requests...")
        help_requests_data = [
            {
                'user_id': user2.id,
                'name': 'Anil Verma',
                'contact_number': '+91-9876543220',
                'help_type': 'water',
                'urgency': 'critical',
                'description': 'Urgent need for drinking water, 30 families affected',
                'location_address': 'Rohini, New Delhi, Delhi 110085, India',
                'latitude': 28.7469,
                'longitude': 77.0672,
                'people_affected': 30,
                'status': 'pending'
            },
            {
                'user_id': user1.id,
                'name': 'Sunita Devi',
                'contact_number': '+91-9876543221',
                'help_type': 'medical',
                'urgency': 'high',
                'description': 'Medical assistance needed, elderly people with chronic conditions',
                'location_address': 'Lajpat Nagar, New Delhi, Delhi 110024, India',
                'latitude': 28.5677,
                'longitude': 77.2434,
                'people_affected': 5,
                'status': 'pending'
            },
            {
                'user_id': user3.id,
                'name': 'Mohammed Ali',
                'contact_number': '+91-9876543222',
                'help_type': 'shelter',
                'urgency': 'high',
                'description': 'Family displaced, need temporary shelter',
                'location_address': 'Jamia Nagar, New Delhi, Delhi 110025, India',
                'latitude': 28.5594,
                'longitude': 77.2837,
                'people_affected': 8,
                'status': 'pending'
            },
            {
                'user_id': user2.id,
                'name': 'Ramesh Gupta',
                'contact_number': '+91-9876543223',
                'help_type': 'food',
                'urgency': 'medium',
                'description': 'Need food supplies for community members',
                'location_address': 'Vasant Kunj, New Delhi, Delhi 110070, India',
                'latitude': 28.5200,
                'longitude': 77.1600,
                'people_affected': 25,
                'status': 'pending'
            },
            {
                'user_id': user1.id,
                'name': 'Crisis Point',
                'contact_number': '+91-9876543224',
                'help_type': 'rescue',
                'urgency': 'critical',
                'description': 'People stranded, immediate rescue needed',
                'location_address': 'Yamuna Bank, New Delhi, Delhi 110092, India',
                'latitude': 28.6472,
                'longitude': 77.2773,
                'people_affected': 15,
                'status': 'pending'
            }
        ]

        for data in help_requests_data:
            help_request = HelpRequest(**data)
            db.session.add(help_request)

        db.session.commit()
        print(f"Created {HelpRequest.query.count()} help requests")

        # Create sample shelters
        print("Creating sample shelters...")
        shelters_data = [
            {
                'user_id': admin.id,
                'shelter_name': 'Central Relief Shelter',
                'contact_person': 'Dr. Amit Singh',
                'contact_number': '+91-9876543230',
                'location_address': 'India Gate, New Delhi, Delhi 110001, India',
                'latitude': 28.6129,
                'longitude': 77.2295,
                'total_capacity': 200,
                'current_occupancy': 150,
                'has_food': True,
                'has_water': True,
                'has_medical': True,
                'has_electricity': True,
                'has_toilets': True,
                'operational_status': 'open'
            },
            {
                'user_id': user3.id,
                'shelter_name': 'Community Hall Shelter',
                'contact_person': 'Mrs. Geeta Rao',
                'contact_number': '+91-9876543231',
                'location_address': 'Nehru Place, New Delhi, Delhi 110019, India',
                'latitude': 28.5494,
                'longitude': 77.2501,
                'total_capacity': 100,
                'current_occupancy': 80,
                'has_food': True,
                'has_water': True,
                'has_medical': False,
                'has_electricity': True,
                'has_toilets': True,
                'operational_status': 'open'
            },
            {
                'user_id': admin.id,
                'shelter_name': 'School Emergency Shelter',
                'contact_person': 'Principal Sharma',
                'contact_number': '+91-9876543232',
                'location_address': 'Pitampura, New Delhi, Delhi 110034, India',
                'latitude': 28.6928,
                'longitude': 77.1313,
                'total_capacity': 150,
                'current_occupancy': 150,
                'has_food': True,
                'has_water': True,
                'has_medical': True,
                'has_electricity': False,
                'has_toilets': True,
                'operational_status': 'full'
            },
            {
                'user_id': user3.id,
                'shelter_name': 'Temple Relief Camp',
                'contact_person': 'Pandit Ramesh',
                'contact_number': '+91-9876543233',
                'location_address': 'Hauz Khas, New Delhi, Delhi 110016, India',
                'latitude': 28.5494,
                'longitude': 77.2001,
                'total_capacity': 75,
                'current_occupancy': 30,
                'has_food': True,
                'has_water': True,
                'has_medical': False,
                'has_electricity': True,
                'has_toilets': True,
                'operational_status': 'open'
            }
        ]

        for data in shelters_data:
            shelter = Shelter(**data)
            db.session.add(shelter)

        db.session.commit()
        print(f"Created {Shelter.query.count()} shelters")

        print("\n" + "="*50)
        print("Database seeded successfully!")
        print("="*50)
        print("\nSample login credentials:")
        print("Admin User:")
        print("  Username: admin")
        print("  Password: admin123")
        print("\nRegular User:")
        print("  Username: john_doe")
        print("  Password: password123")
        print("="*50)

if __name__ == '__main__':
    seed_database()
