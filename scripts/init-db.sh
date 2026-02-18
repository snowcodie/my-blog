#!/bin/bash

# Initialize database on first deployment
# This script is called during the build process

if [ -z "$DB_HOST" ]; then
  echo "Database configuration not found. Skipping initialization."
  exit 0
fi

echo "Database configuration found. Initializing database tables..."

# The database initialization is handled automatically by the db.ts module
# when the first API request is made

exit 0
