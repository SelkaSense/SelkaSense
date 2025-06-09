# Use a lightweight Python base image
FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Copy backend
COPY backend/ ./backend/

# Copy scripts
COPY scripts/ ./scripts/

# Install dependencies (example)
RUN pip install flask

# Default command
CMD ["python", "backend/SelkaSense_oracle.py"]
