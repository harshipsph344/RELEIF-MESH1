from flask import Blueprint, request, jsonify, session
from models import db, Resource, HelpRequest, Shelter, User
from utils import geocode_address, add_distances_to_items, filter_by_radius
from auth import login_required, admin_required

api_bp = Blueprint('api', __name__)


# ==================== RESOURCE ROUTES ====================

@api_bp.route('/resources', methods=['GET'])
def get_resources():
    """
    Get all resources with optional filtering.
    Query params: resource_type, status, user_lat, user_lon, radius
    """
    try:
        resources = Resource.query.all()
        resource_list = [r.to_dict() for r in resources]

        # Apply filters
        resource_type = request.args.get('resource_type')
        status = request.args.get('status')
        user_lat = request.args.get('user_lat', type=float)
        user_lon = request.args.get('user_lon', type=float)
        radius = request.args.get('radius', type=float)

        if resource_type:
            resource_list = [r for r in resource_list if r['resource_type'] == resource_type]

        if status:
            resource_list = [r for r in resource_list if r['status'] == status]

        # Add distances if user location provided
        if user_lat is not None and user_lon is not None:
            if radius:
                resource_list = filter_by_radius(resource_list, user_lat, user_lon, radius)
            else:
                resource_list = add_distances_to_items(resource_list, user_lat, user_lon)
                # Sort by distance
                resource_list.sort(key=lambda x: x.get('distance', float('inf')) if isinstance(x.get('distance'), (int, float)) else float('inf'))

        return jsonify({
            'resources': resource_list,
            'count': len(resource_list)
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@api_bp.route('/resources', methods=['POST'])
@login_required
def create_resource():
    """
    Create a new resource donation.
    """
    try:
        current_user_id = session['user_id']
        data = request.get_json()

        # Validate required fields
        required_fields = ['name', 'contact_number', 'resource_type', 'quantity', 'location_address']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({'error': f'{field} is required'}), 400

        # Geocode address
        lat, lon = geocode_address(data['location_address'])
        if lat is None or lon is None:
            return jsonify({'error': 'Could not geocode address. Please provide a valid address.'}), 400

        # Create resource
        new_resource = Resource(
            user_id=current_user_id,
            name=data['name'],
            contact_number=data['contact_number'],
            resource_type=data['resource_type'],
            quantity=data['quantity'],
            description=data.get('description', ''),
            location_address=data['location_address'],
            latitude=lat,
            longitude=lon,
            status=data.get('status', 'available')
        )

        db.session.add(new_resource)
        db.session.commit()

        return jsonify({
            'message': 'Resource created successfully',
            'resource': new_resource.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@api_bp.route('/resources/<int:resource_id>', methods=['PUT'])
@login_required
def update_resource(resource_id):
    """
    Update a resource.
    """
    try:
        current_user_id = session['user_id']
        resource = Resource.query.get(resource_id)

        if not resource:
            return jsonify({'error': 'Resource not found'}), 404

        # Check if user owns the resource or is admin
        current_user = User.query.get(current_user_id)
        if resource.user_id != current_user_id and not current_user.is_admin:
            return jsonify({'error': 'Unauthorized'}), 403

        data = request.get_json()

        # Update fields
        if 'name' in data:
            resource.name = data['name']
        if 'contact_number' in data:
            resource.contact_number = data['contact_number']
        if 'resource_type' in data:
            resource.resource_type = data['resource_type']
        if 'quantity' in data:
            resource.quantity = data['quantity']
        if 'description' in data:
            resource.description = data['description']
        if 'status' in data:
            resource.status = data['status']
        if 'location_address' in data:
            lat, lon = geocode_address(data['location_address'])
            if lat and lon:
                resource.location_address = data['location_address']
                resource.latitude = lat
                resource.longitude = lon

        db.session.commit()

        return jsonify({
            'message': 'Resource updated successfully',
            'resource': resource.to_dict()
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@api_bp.route('/resources/<int:resource_id>', methods=['DELETE'])
@login_required
def delete_resource(resource_id):
    """
    Delete a resource.
    """
    try:
        current_user_id = session['user_id']
        resource = Resource.query.get(resource_id)

        if not resource:
            return jsonify({'error': 'Resource not found'}), 404

        # Check if user owns the resource or is admin
        current_user = User.query.get(current_user_id)
        if resource.user_id != current_user_id and not current_user.is_admin:
            return jsonify({'error': 'Unauthorized'}), 403

        db.session.delete(resource)
        db.session.commit()

        return jsonify({'message': 'Resource deleted successfully'}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


# ==================== HELP REQUEST ROUTES ====================

@api_bp.route('/help-requests', methods=['GET'])
def get_help_requests():
    """
    Get all help requests with optional filtering.
    Query params: help_type, urgency, status, user_lat, user_lon, radius
    """
    try:
        help_requests = HelpRequest.query.all()
        request_list = [r.to_dict() for r in help_requests]

        # Apply filters
        help_type = request.args.get('help_type')
        urgency = request.args.get('urgency')
        status = request.args.get('status')
        user_lat = request.args.get('user_lat', type=float)
        user_lon = request.args.get('user_lon', type=float)
        radius = request.args.get('radius', type=float)

        if help_type:
            request_list = [r for r in request_list if r['help_type'] == help_type]

        if urgency:
            request_list = [r for r in request_list if r['urgency'] == urgency]

        if status:
            request_list = [r for r in request_list if r['status'] == status]

        # Add distances if user location provided
        if user_lat is not None and user_lon is not None:
            if radius:
                request_list = filter_by_radius(request_list, user_lat, user_lon, radius)
            else:
                request_list = add_distances_to_items(request_list, user_lat, user_lon)

        # Sort by urgency priority
        urgency_priority = {'critical': 0, 'high': 1, 'medium': 2, 'low': 3}
        request_list.sort(key=lambda x: urgency_priority.get(x['urgency'], 4))

        return jsonify({
            'help_requests': request_list,
            'count': len(request_list)
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@api_bp.route('/help-requests', methods=['POST'])
@login_required
def create_help_request():
    """
    Create a new help request.
    """
    try:
        current_user_id = session['user_id']
        data = request.get_json()

        # Validate required fields
        required_fields = ['name', 'contact_number', 'help_type', 'urgency', 'description', 'location_address', 'people_affected']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({'error': f'{field} is required'}), 400

        # Geocode address
        lat, lon = geocode_address(data['location_address'])
        if lat is None or lon is None:
            return jsonify({'error': 'Could not geocode address. Please provide a valid address.'}), 400

        # Create help request
        new_request = HelpRequest(
            user_id=current_user_id,
            name=data['name'],
            contact_number=data['contact_number'],
            help_type=data['help_type'],
            urgency=data['urgency'],
            description=data['description'],
            location_address=data['location_address'],
            latitude=lat,
            longitude=lon,
            people_affected=data['people_affected'],
            status=data.get('status', 'pending')
        )

        db.session.add(new_request)
        db.session.commit()

        return jsonify({
            'message': 'Help request created successfully',
            'help_request': new_request.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@api_bp.route('/help-requests/<int:request_id>', methods=['PUT'])
@login_required
def update_help_request(request_id):
    """
    Update a help request.
    """
    try:
        current_user_id = session['user_id']
        help_request = HelpRequest.query.get(request_id)

        if not help_request:
            return jsonify({'error': 'Help request not found'}), 404

        # Check if user owns the request or is admin
        current_user = User.query.get(current_user_id)
        if help_request.user_id != current_user_id and not current_user.is_admin:
            return jsonify({'error': 'Unauthorized'}), 403

        data = request.get_json()

        # Update fields
        if 'name' in data:
            help_request.name = data['name']
        if 'contact_number' in data:
            help_request.contact_number = data['contact_number']
        if 'help_type' in data:
            help_request.help_type = data['help_type']
        if 'urgency' in data:
            help_request.urgency = data['urgency']
        if 'description' in data:
            help_request.description = data['description']
        if 'people_affected' in data:
            help_request.people_affected = data['people_affected']
        if 'status' in data:
            help_request.status = data['status']
        if 'location_address' in data:
            lat, lon = geocode_address(data['location_address'])
            if lat and lon:
                help_request.location_address = data['location_address']
                help_request.latitude = lat
                help_request.longitude = lon

        db.session.commit()

        return jsonify({
            'message': 'Help request updated successfully',
            'help_request': help_request.to_dict()
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@api_bp.route('/help-requests/<int:request_id>', methods=['DELETE'])
@login_required
def delete_help_request(request_id):
    """
    Delete a help request.
    """
    try:
        current_user_id = session['user_id']
        help_request = HelpRequest.query.get(request_id)

        if not help_request:
            return jsonify({'error': 'Help request not found'}), 404

        # Check if user owns the request or is admin
        current_user = User.query.get(current_user_id)
        if help_request.user_id != current_user_id and not current_user.is_admin:
            return jsonify({'error': 'Unauthorized'}), 403

        db.session.delete(help_request)
        db.session.commit()

        return jsonify({'message': 'Help request deleted successfully'}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


# ==================== SHELTER ROUTES ====================

@api_bp.route('/shelters', methods=['GET'])
def get_shelters():
    """
    Get all shelters with optional filtering.
    Query params: operational_status, user_lat, user_lon, radius
    """
    try:
        shelters = Shelter.query.all()
        shelter_list = [s.to_dict() for s in shelters]

        # Apply filters
        operational_status = request.args.get('operational_status')
        user_lat = request.args.get('user_lat', type=float)
        user_lon = request.args.get('user_lon', type=float)
        radius = request.args.get('radius', type=float)

        if operational_status:
            shelter_list = [s for s in shelter_list if s['operational_status'] == operational_status]

        # Add distances if user location provided
        if user_lat is not None and user_lon is not None:
            if radius:
                shelter_list = filter_by_radius(shelter_list, user_lat, user_lon, radius)
            else:
                shelter_list = add_distances_to_items(shelter_list, user_lat, user_lon)
                # Sort by distance
                shelter_list.sort(key=lambda x: x.get('distance', float('inf')) if isinstance(x.get('distance'), (int, float)) else float('inf'))

        return jsonify({
            'shelters': shelter_list,
            'count': len(shelter_list)
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@api_bp.route('/shelters', methods=['POST'])
@login_required
def create_shelter():
    """
    Create a new shelter.
    """
    try:
        current_user_id = session['user_id']
        data = request.get_json()

        # Validate required fields
        required_fields = ['shelter_name', 'contact_person', 'contact_number', 'location_address', 'total_capacity']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({'error': f'{field} is required'}), 400

        # Geocode address
        lat, lon = geocode_address(data['location_address'])
        if lat is None or lon is None:
            return jsonify({'error': 'Could not geocode address. Please provide a valid address.'}), 400

        # Create shelter
        new_shelter = Shelter(
            user_id=current_user_id,
            shelter_name=data['shelter_name'],
            contact_person=data['contact_person'],
            contact_number=data['contact_number'],
            location_address=data['location_address'],
            latitude=lat,
            longitude=lon,
            total_capacity=data['total_capacity'],
            current_occupancy=data.get('current_occupancy', 0),
            has_food=data.get('has_food', False),
            has_water=data.get('has_water', False),
            has_medical=data.get('has_medical', False),
            has_electricity=data.get('has_electricity', False),
            has_toilets=data.get('has_toilets', False),
            operational_status=data.get('operational_status', 'open')
        )

        db.session.add(new_shelter)
        db.session.commit()

        return jsonify({
            'message': 'Shelter created successfully',
            'shelter': new_shelter.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@api_bp.route('/shelters/<int:shelter_id>', methods=['PUT'])
@login_required
def update_shelter(shelter_id):
    """
    Update a shelter.
    """
    try:
        current_user_id = session['user_id']
        shelter = Shelter.query.get(shelter_id)

        if not shelter:
            return jsonify({'error': 'Shelter not found'}), 404

        # Check if user owns the shelter or is admin
        current_user = User.query.get(current_user_id)
        if shelter.user_id != current_user_id and not current_user.is_admin:
            return jsonify({'error': 'Unauthorized'}), 403

        data = request.get_json()

        # Update fields
        if 'shelter_name' in data:
            shelter.shelter_name = data['shelter_name']
        if 'contact_person' in data:
            shelter.contact_person = data['contact_person']
        if 'contact_number' in data:
            shelter.contact_number = data['contact_number']
        if 'total_capacity' in data:
            shelter.total_capacity = data['total_capacity']
        if 'current_occupancy' in data:
            shelter.current_occupancy = data['current_occupancy']
        if 'has_food' in data:
            shelter.has_food = data['has_food']
        if 'has_water' in data:
            shelter.has_water = data['has_water']
        if 'has_medical' in data:
            shelter.has_medical = data['has_medical']
        if 'has_electricity' in data:
            shelter.has_electricity = data['has_electricity']
        if 'has_toilets' in data:
            shelter.has_toilets = data['has_toilets']
        if 'operational_status' in data:
            shelter.operational_status = data['operational_status']
        if 'location_address' in data:
            lat, lon = geocode_address(data['location_address'])
            if lat and lon:
                shelter.location_address = data['location_address']
                shelter.latitude = lat
                shelter.longitude = lon

        db.session.commit()

        return jsonify({
            'message': 'Shelter updated successfully',
            'shelter': shelter.to_dict()
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@api_bp.route('/shelters/<int:shelter_id>', methods=['DELETE'])
@login_required
def delete_shelter(shelter_id):
    """
    Delete a shelter.
    """
    try:
        current_user_id = session['user_id']
        shelter = Shelter.query.get(shelter_id)

        if not shelter:
            return jsonify({'error': 'Shelter not found'}), 404

        # Check if user owns the shelter or is admin
        current_user = User.query.get(current_user_id)
        if shelter.user_id != current_user_id and not current_user.is_admin:
            return jsonify({'error': 'Unauthorized'}), 403

        db.session.delete(shelter)
        db.session.commit()

        return jsonify({'message': 'Shelter deleted successfully'}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


# ==================== ADMIN/STATS ROUTES ====================

@api_bp.route('/stats', methods=['GET'])
@login_required
def get_stats():
    """
    Get statistics for admin dashboard.
    """
    try:
        current_user_id = session['user_id']
        current_user = User.query.get(current_user_id)

        if not current_user or not current_user.is_admin:
            return jsonify({'error': 'Admin access required'}), 403

        # Count statistics
        total_resources = Resource.query.count()
        available_resources = Resource.query.filter_by(status='available').count()

        total_help_requests = HelpRequest.query.count()
        pending_requests = HelpRequest.query.filter_by(status='pending').count()
        critical_requests = HelpRequest.query.filter_by(urgency='critical').count()

        total_shelters = Shelter.query.count()
        open_shelters = Shelter.query.filter_by(operational_status='open').count()

        total_users = User.query.count()

        # Calculate total people affected
        total_people_affected = db.session.query(db.func.sum(HelpRequest.people_affected)).scalar() or 0

        # Calculate total shelter capacity and occupancy
        total_capacity = db.session.query(db.func.sum(Shelter.total_capacity)).scalar() or 0
        total_occupancy = db.session.query(db.func.sum(Shelter.current_occupancy)).scalar() or 0

        return jsonify({
            'resources': {
                'total': total_resources,
                'available': available_resources
            },
            'help_requests': {
                'total': total_help_requests,
                'pending': pending_requests,
                'critical': critical_requests,
                'people_affected': total_people_affected
            },
            'shelters': {
                'total': total_shelters,
                'open': open_shelters,
                'total_capacity': total_capacity,
                'total_occupancy': total_occupancy,
                'available_spaces': total_capacity - total_occupancy
            },
            'users': {
                'total': total_users
            }
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
