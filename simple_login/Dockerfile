FROM python:3.12-slim

RUN apt-get update && apt-get install -y --no-install-recommends sqlite3 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY init.sql .

RUN sqlite3 db.sqlite3 < init.sql

COPY app.py .

ENV PYTHONUNBUFFERED=1

EXPOSE 5000

CMD ["python3","app.py"]
