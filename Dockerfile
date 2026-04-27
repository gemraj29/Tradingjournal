# Use an official Python runtime as a parent image
FROM python:3.10-slim-buster

# Set the working directory in the container
WORKDIR /app

# Install system dependencies required for psycopg2 (asyncpg)
# and other potential build tools.
# For Debian-based images, these are typically build-essential, libpq-dev.
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy pyproject.toml and install dependencies
# This allows Docker to cache the dependency layer
COPY pyproject.toml ./
RUN pip install --no-cache-dir .

# Copy the rest of the application code
COPY src/ ./src/

# Expose the port the app runs on
EXPOSE 8000

# Run the application using uvicorn
# Assuming the main FastAPI app instance is named 'app' in 'src/main.py'
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
