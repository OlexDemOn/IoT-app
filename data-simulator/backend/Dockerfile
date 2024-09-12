# Use the official Python image from the Docker Hub
FROM python:3.12-slim

# Set the working directory
WORKDIR /app

# Install dependencies
COPY requirements.txt .

# Update pip to the latest version
RUN pip install --upgrade pip

# Install required packages
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY . .

# Expose port 5000
EXPOSE 5000

# Run the application
CMD ["python", "main.py"]

ENTRYPOINT ["python", "/app/app.py"]

