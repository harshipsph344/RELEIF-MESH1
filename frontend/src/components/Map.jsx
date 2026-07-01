import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons
const greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const yellowIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export default function Map({ resources = [], helpRequests = [], shelters = [], center = [28.6139, 77.2090], zoom = 12 }) {
  return (
    <div className="h-full w-full rounded-lg overflow-hidden shadow-lg">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Resource Markers (Green) */}
        {resources.map((resource) => (
          <Marker
            key={`resource-${resource.id}`}
            position={[resource.latitude, resource.longitude]}
            icon={greenIcon}
          >
            <Popup>
              <div className="min-w-[200px]">
                <h3 className="font-bold text-green-700 mb-2">Available Resource</h3>
                <p><strong>Type:</strong> {resource.resource_type}</p>
                <p><strong>Quantity:</strong> {resource.quantity}</p>
                <p><strong>Provider:</strong> {resource.name}</p>
                <p><strong>Contact:</strong> {resource.contact_number}</p>
                <p><strong>Location:</strong> {resource.location_address}</p>
                {resource.description && <p><strong>Details:</strong> {resource.description}</p>}
                {resource.distance && <p><strong>Distance:</strong> {resource.distance} km away</p>}
                <p><strong>Status:</strong> <span className="capitalize">{resource.status}</span></p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Help Request Markers (Red) */}
        {helpRequests.map((request) => (
          <Marker
            key={`help-${request.id}`}
            position={[request.latitude, request.longitude]}
            icon={redIcon}
          >
            <Popup>
              <div className="min-w-[200px]">
                <h3 className="font-bold text-red-700 mb-2">Help Needed</h3>
                <p><strong>Type:</strong> {request.help_type}</p>
                <p><strong>Urgency:</strong> <span className={`capitalize font-semibold ${
                  request.urgency === 'critical' ? 'text-red-600' :
                  request.urgency === 'high' ? 'text-orange-600' :
                  request.urgency === 'medium' ? 'text-yellow-600' : 'text-gray-600'
                }`}>{request.urgency}</span></p>
                <p><strong>Contact:</strong> {request.name}</p>
                <p><strong>Phone:</strong> {request.contact_number}</p>
                <p><strong>People Affected:</strong> {request.people_affected}</p>
                <p><strong>Location:</strong> {request.location_address}</p>
                <p><strong>Details:</strong> {request.description}</p>
                {request.distance && <p><strong>Distance:</strong> {request.distance} km away</p>}
                <p><strong>Status:</strong> <span className="capitalize">{request.status}</span></p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Shelter Markers (Yellow) */}
        {shelters.map((shelter) => (
          <Marker
            key={`shelter-${shelter.id}`}
            position={[shelter.latitude, shelter.longitude]}
            icon={yellowIcon}
          >
            <Popup>
              <div className="min-w-[200px]">
                <h3 className="font-bold text-yellow-700 mb-2">Relief Shelter</h3>
                <p><strong>Name:</strong> {shelter.shelter_name}</p>
                <p><strong>Contact:</strong> {shelter.contact_person}</p>
                <p><strong>Phone:</strong> {shelter.contact_number}</p>
                <p><strong>Location:</strong> {shelter.location_address}</p>
                <p><strong>Capacity:</strong> {shelter.current_occupancy}/{shelter.total_capacity} ({shelter.total_capacity - shelter.current_occupancy} spaces available)</p>
                <div className="mt-2">
                  <strong>Facilities:</strong>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {shelter.has_food && <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Food</span>}
                    {shelter.has_water && <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">Water</span>}
                    {shelter.has_medical && <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">Medical</span>}
                    {shelter.has_electricity && <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">Electricity</span>}
                    {shelter.has_toilets && <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">Toilets</span>}
                  </div>
                </div>
                {shelter.distance && <p><strong>Distance:</strong> {shelter.distance} km away</p>}
                <p><strong>Status:</strong> <span className={`capitalize font-semibold ${
                  shelter.operational_status === 'open' ? 'text-green-600' :
                  shelter.operational_status === 'full' ? 'text-orange-600' : 'text-red-600'
                }`}>{shelter.operational_status}</span></p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
