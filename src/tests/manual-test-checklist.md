# Manual Testing Checklist

## Home Page (`/`)
- [ ] Liquid background animation
- [ ] "Find Loaded Tea Near You" button
  - [ ] Click triggers location request
  - [ ] Success redirects to search results
  - [ ] Error shows error message
- [ ] Popular Locations grid
  - [ ] Jacksonville card click
  - [ ] St. Augustine card click
  - [ ] Orlando card click
  - [ ] Tampa card click

## Navigation
- [ ] Logo/Home link
- [ ] Search button/link
- [ ] Dashboard link (when logged in)
- [ ] Sign in link (when logged out)
- [ ] Sign out button (when logged in)

## Search Page (`/search`)
- [ ] Search input field
- [ ] Search button functionality
- [ ] Location detection
- [ ] Results display
  - [ ] "In [City]" section
  - [ ] "Nearby Locations" section
- [ ] Individual result cards
  - [ ] Distance display
  - [ ] Save button
  - [ ] Directions link
  - [ ] More info button

## Authentication
### Sign In (`/login`)
- [ ] Email input
- [ ] Password input
- [ ] Sign in button
- [ ] Error messages
- [ ] "Sign up" link
- [ ] Redirect after successful login

### Sign Up (`/register`)
- [ ] Name input
- [ ] Email input
- [ ] Password input
- [ ] Confirm password input
- [ ] Register button
- [ ] Error messages
- [ ] "Sign in" link
- [ ] Redirect after successful registration

## Dashboard (`/dashboard`)
### Navigation Tabs
- [ ] Saved Locations tab
- [ ] Business Claims tab
- [ ] Business Management tab
- [ ] Reviews tab
- [ ] Profile Settings tab

### Saved Locations
- [ ] List of saved locations
- [ ] Remove save button
- [ ] View details button
- [ ] Get directions link

### Business Claims
- [ ] Claim business form
- [ ] List of pending claims
- [ ] Claim status updates

### Business Management
- [ ] List of claimed businesses
- [ ] Edit business info
- [ ] Update hours
- [ ] Manage photos

### Reviews
- [ ] List of reviews
- [ ] Reply to reviews
- [ ] Review metrics

### Profile Settings
- [ ] Update profile info
- [ ] Change password
- [ ] Email preferences

## Error States
- [ ] 404 Page
- [ ] Network error handling
- [ ] Authentication error messages
- [ ] Form validation errors
- [ ] API error responses

## Loading States
- [ ] Search loading
- [ ] Authentication loading
- [ ] Dashboard data loading
- [ ] Save location loading
- [ ] Business claim loading

## Mobile Responsiveness
- [ ] Home page layout
- [ ] Search results layout
- [ ] Dashboard layout
- [ ] Navigation menu
- [ ] Forms and inputs
- [ ] Button sizes and spacing
