# Use an official Python runtime as a parent image
FROM python:3.10-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PORT=8000

# Set the working directory in the container
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Copy the requirements file into the container
COPY requirements.txt .

# Install dependencies (CPU-Only Optimization)
# 1. Install pip upgrade
# 2. Install torch/torchvision CPU VERSION (v. important to save 2GB+ space and RAM)
# 3. Install the rest of the requirements
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir torch torchvision --index-url https://download.pytorch.org/whl/cpu && \
    pip install --no-cache-dir -r requirements.txt

# Copy the rest of the backend application code
COPY . .

# Expose the port (Render will override this, but good for local)
EXPOSE 8000

# Command to run the application using the $PORT provided by Render
# We use the shell form here to ensure $PORT is expanded
CMD python -m uvicorn main:app --host 0.0.0.0 --port ${PORT}
