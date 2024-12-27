#!/bin/bash

# Kill any process using port 3004
lsof -ti:3004 | xargs kill -9 2>/dev/null

# Clean up build artifacts
rm -rf .next

# Start the development server
npm run dev
