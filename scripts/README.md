# Tea Finder Data Processing Scripts

## Nutrition Club Data Processing

### Prerequisites
- Node.js (v14+ recommended)
- MongoDB (local or cloud instance)

### Setup
1. Install dependencies:
```bash
npm install
```

2. Set MongoDB Connection
Set the `MONGODB_URI` environment variable to your MongoDB connection string:
```bash
export MONGODB_URI=mongodb://localhost:27017
# Or for cloud MongoDB
export MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/
```

### Running the Script
```bash
npm run process-clubs
```

### Data Processing Steps
- Extracts nutrition club data from JSON
- Normalizes address information
- Categorizes clubs by state
- Generates unique MongoDB document IDs
- Saves processed data to:
  1. Local JSON file (`processed-nutrition-clubs.json`)
  2. MongoDB collections (`nutrition-clubs` and `state-stats`)

### Data Structure
#### Nutrition Clubs Collection
- `_id`: Unique identifier
- `name`: Club name
- `address`: 
  - `full`: Normalized address
  - `state`: Two-letter state abbreviation
- `contact`: Phone and phone link
- `socialMedia`: Facebook and Instagram links
- `profileLink`: Original directory profile
- `image`: Club image URL
- `metadata`: Import source and timestamp

#### State Statistics Collection
- `state`: Two-letter state abbreviation
- `clubCount`: Number of clubs in the state

### Troubleshooting
- Ensure MongoDB is running
- Check environment variables
- Verify JSON input file path
