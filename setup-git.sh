#!/bin/bash

# Initialize git repository
git init

# Add remote origin
git remote add origin https://github.com/amo350/surfbloom.git

# Stage all files
git add .

# Create first commit
git commit -m "Initial commit"

# Set main branch (if needed)
git branch -M main

# Push to GitHub
git push -u origin main

echo "✅ Repository initialized and pushed to GitHub!"
