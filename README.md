# RelayNest - Community Disaster Relief Coordination Platform

A comprehensive web platform for coordinating disaster relief efforts, enabling real-time resource sharing, help requests, and shelter management during emergencies.

## Features

### Core Functionality
- **Resource Donations**: Share available supplies (water, food, medicine, shelter space)
- **Help Requests**: Submit assistance requests with urgency levels
- **Shelter Registration**: Register and manage relief shelters with capacity tracking
- **Interactive Map**: Visual map with color-coded markers (Green=Resources, Red=Help Requests, Yellow=Shelters)
- **Real-time Updates**: Auto-refresh polling every 60 seconds
- **Distance Calculation**: Haversine formula-based distance from user location
- **Search & Filters**: Filter by type, urgency, radius, and status

### User Features
- User authentication with JWT
- Personal dashboard with all relief data
- Location-based sorting and filtering
- Submit and manage own entries
- In-app notifications

### Admin Features
- Comprehensive admin dashboard
- System statistics and analytics
- User management
- Overview of all resources, requests, and shelters
- Capacity and occupancy tracking

## Tech Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **shadcn/ui** - Component library
- **Tailwind CSS** - Styling
- **React-Leaflet** - Interactive maps
- **Axios** - HTTP client

### Backend
- **Flask** - Python web framework
- **SQLite** - Database (development)
- **Flask-JWT-Extended** - JWT authentication
- **GeoPy** - Geocoding and distance calculation
- **Flask-CORS** - Cross-origin resource sharing
- **bcrypt** - Password hashing

## Project Structure

```
Relief-Mesh/
├── backend/
│   ├── app.py                 # Flask application
│   ├── models.py              # Database models
│   ├── routes.py              # API routes
│   ├── auth.py                # Authentication routes
│   ├── config.py              # Configuration
│   ├── utils.py               # Utility functions
│   ├── seed_data.py           # Sample data script
│   ├── requirements.txt       # Python dependencies
│   └── .env.example           # Environment variables template
│
├── frontend/
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── ui/            # shadcn/ui components
│   │   │   ├── Map.jsx        # Interactive map
│   │   │   ├── ResourceForm.jsx
│   │   │   ├── HelpRequestForm.jsx
│   │   │   └── ShelterForm.jsx
│   │   ├── pages/             # Page components
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   └── AdminDashboard.jsx
│   │   ├── context/           # React contexts
│   │   │   └── AuthContext.jsx
│   │   ├── lib/               # Utilities and API
│   │   │   ├── api.js
│   │   │   └── utils.js
│   │   ├── App.jsx            # Main app component
│   │   ├── main.jsx           # Entry point
│   │   └── index.css          # Global styles
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
│
└── README.md
```

## Installation & Setup

### Prerequisites
- Python 3.8 or higher
- Node.js 16 or higher
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment (recommended):
```bash
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

3. Install Python dependencies:
```bash
pip install -r requirements.txt
```

4. (Optional) Create a `.env` file for custom configuration:
```bash
cp .env.example .env
# Edit .env with your preferred settings
```

5. Initialize the database with sample data:
```bash
python seed_data.py
```

6. Start the Flask backend:
```bash
python app.py
```

The backend will run at `http://localhost:5000`

### Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run at `http://localhost:3000`

## Usage

### Sample Login Credentials

After running the seed script, you can log in with:

**Admin User:**
- Username: `admin`
- Password: `admin123`

**Regular User:**
- Username: `john_doe`
- Password: `password123`

### User Workflow

1. **Sign Up / Log In**
   - Create a new account or log in with existing credentials

2. **View Relief Map**
   - See all resources, help requests, and shelters on the interactive map
   - Click markers for detailed information

3. **Add Resources**
   - Click "Add Resource" button
   - Fill in details (type, quantity, location)
   - Location is automatically geocoded

4. **Request Help**
   - Click "Request Help" button
   - Specify help type, urgency, and details
   - System notifies nearby users

5. **Register Shelter**
   - Click "Register Shelter" button
   - Enter shelter details and facilities
   - Track capacity and occupancy

6. **Use Filters**
   - Filter by radius (5km, 10km, 25km, 50km)
   - Filter by resource type, help type, urgency
   - Sort by distance from your location

7. **View Data Tables**
   - Browse resources, help requests, and shelters in organized tables
   - See distance calculations from your location

8. **Admin Dashboard** (Admin users only)
   - View comprehensive statistics
   - Monitor critical requests
   - Track shelter capacity
   - Manage system overview

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `GET /api/auth/users` - Get all users (admin only)

### Resources
- `GET /api/resources` - Get all resources (with optional filters)
- `POST /api/resources` - Create resource (authenticated)
- `PUT /api/resources/:id` - Update resource (owner/admin)
- `DELETE /api/resources/:id` - Delete resource (owner/admin)

### Help Requests
- `GET /api/help-requests` - Get all help requests (with filters)
- `POST /api/help-requests` - Create help request (authenticated)
- `PUT /api/help-requests/:id` - Update request (owner/admin)
- `DELETE /api/help-requests/:id` - Delete request (owner/admin)

### Shelters
- `GET /api/shelters` - Get all shelters (with filters)
- `POST /api/shelters` - Create shelter (authenticated)
- `PUT /api/shelters/:id` - Update shelter (owner/admin)
- `DELETE /api/shelters/:id` - Delete shelter (owner/admin)

### Statistics
- `GET /api/stats` - Get system statistics (admin only)

## Features in Detail

### Geocoding
- Automatic address-to-coordinates conversion using GeoPy
- Uses OpenStreetMap Nominatim API
- Fallback handling for invalid addresses

### Distance Calculation
- Haversine formula for accurate distance between coordinates
- Real-time distance display in kilometers
- Radius-based filtering (5km, 10km, 25km, 50km)

### Auto-Refresh Polling
- Automatic data refresh every 60 seconds
- Manual refresh button available
- Loading indicators during refresh

### In-App Notifications
- Toast notifications for actions
- Success/error feedback
- Non-intrusive design

### Status Tracking
- Resources: Available, Allocated, Exhausted
- Help Requests: Pending, In Progress, Fulfilled
- Shelters: Open, Full, Closed

## Development

### Building for Production

**Backend:**
```bash
# Backend runs as-is, but consider:
# - Using PostgreSQL instead of SQLite
# - Setting up proper environment variables
# - Configuring production WSGI server (gunicorn)
```

**Frontend:**
```bash
cd frontend
npm run build
```

The build output will be in `frontend/dist/`

### Environment Variables

**Backend (.env):**
```env
JWT_SECRET_KEY=your-secret-key-here
SECRET_KEY=your-flask-secret-here
```

## Future Enhancements

- Real-time WebSocket updates
- Email/SMS notifications
- Multi-language support
- Mobile app (React Native)
- Volunteer coordination
- Donation tracking
- Emergency alerts system
- AI-based resource matching
- Analytics and reporting

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
## 🌐 Live Demo

[View ReliefMesh Live Demo](https://releifmesh.netlify.app/)


## License

This project is open source and available under the MIT License.

## Support

For issues, questions, or suggestions, please open an issue on the repository.

## Acknowledgments

- OpenStreetMap for map tiles
- GeoPy for geocoding services
- shadcn/ui for beautiful components
- Leaflet for mapping capabilities

---

Built with the goal of helping communities coordinate relief efforts effectively during disasters.
