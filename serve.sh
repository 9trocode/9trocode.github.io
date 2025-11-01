#!/bin/bash
# Serve the MkDocs site locally

# Activate virtual environment if it exists
if [ -d "venv" ]; then
    source venv/bin/activate
fi

# Start MkDocs server
echo "Starting MkDocs server..."
echo "Visit: http://127.0.0.1:8000"
mkdocs serve
