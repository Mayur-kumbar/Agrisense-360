FROM python:3.11-slim

WORKDIR /app

# install system deps needed by PIL/GDAL/rasterio if you need them
RUN apt-get update && apt-get install -y \
    build-essential gcc g++ gdal-bin libgdal-dev \
 && rm -rf /var/lib/apt/lists/*

# install pip dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# copy application code
COPY ./app /app/app

# Optional: expose the port your uvicorn will use
EXPOSE 8001

# Run uvicorn - ensure module path matches your code layout
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001", "--workers", "1"]
