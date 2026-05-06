FROM python:3.11-slim AS runtime

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=5001 \
    FLASK_DEBUG=false \
    SQLALCHEMY_ECHO=false \
    DATABASE_PATH=/app/data/beautycx.sqlite

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
      build-essential \
      gcc \
      g++ \
      curl \
      unixodbc-dev \
    && rm -rf /var/lib/apt/lists/*

COPY serverclient/requirements.txt ./requirements.txt
RUN python -m pip install --upgrade pip \
    && pip install --no-cache-dir --use-deprecated=legacy-resolver -r requirements.txt

COPY serverclient/ ./
COPY data/ ./data/

EXPOSE 5001

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:5001/', timeout=3).read()" || exit 1

CMD ["python", "main.py"]
