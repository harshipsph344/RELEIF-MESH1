from geopy.geocoders import Nominatim
from geopy.distance import geodesic
from config import Config

# Initialize geocoder
geolocator = Nominatim(user_agent=Config.GEOCODING_USER_AGENT)

def geocode_address(address):
    """
    Convert an address to latitude and longitude coordinates.

    Args:
        address (str): The address to geocode

    Returns:
        tuple: (latitude, longitude) or (None, None) if geocoding fails
    """
    try:
        location = geolocator.geocode(address)
        if location:
            return location.latitude, location.longitude
        return None, None
    except Exception as e:
        print(f"Geocoding error: {str(e)}")
        return None, None


def calculate_distance(lat1, lon1, lat2, lon2):
    """
    Calculate the distance between two points using the Haversine formula.

    Args:
        lat1 (float): Latitude of point 1
        lon1 (float): Longitude of point 1
        lat2 (float): Latitude of point 2
        lon2 (float): Longitude of point 2

    Returns:
        float: Distance in kilometers
    """
    try:
        point1 = (lat1, lon1)
        point2 = (lat2, lon2)
        distance = geodesic(point1, point2).kilometers
        return round(distance, 2)
    except Exception as e:
        print(f"Distance calculation error: {str(e)}")
        return None


def add_distances_to_items(items, user_lat, user_lon):
    """
    Add distance field to each item in the list based on user's location.

    Args:
        items (list): List of items (resources, help requests, or shelters)
        user_lat (float): User's latitude
        user_lon (float): User's longitude

    Returns:
        list: Items with added 'distance' field
    """
    for item in items:
        distance = calculate_distance(user_lat, user_lon, item['latitude'], item['longitude'])
        item['distance'] = distance if distance is not None else 'N/A'

    return items


def filter_by_radius(items, user_lat, user_lon, radius_km):
    """
    Filter items by distance radius from user's location.

    Args:
        items (list): List of items with latitude and longitude
        user_lat (float): User's latitude
        user_lon (float): User's longitude
        radius_km (float): Radius in kilometers

    Returns:
        list: Filtered items within the radius
    """
    filtered_items = []

    for item in items:
        distance = calculate_distance(user_lat, user_lon, item['latitude'], item['longitude'])
        if distance is not None and distance <= radius_km:
            item['distance'] = distance
            filtered_items.append(item)

    return filtered_items
