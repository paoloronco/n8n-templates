FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY main.py .

# Cloud Run injects PORT (default 8080); main.py reads it at startup.
ENV PORT=8080
EXPOSE 8080

RUN useradd --create-home appuser
USER appuser

CMD ["python", "main.py"]
