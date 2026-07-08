FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN cp entrypoint.sh /entrypoint.sh && sed -i 's/\r$//' /entrypoint.sh && chmod +x /entrypoint.sh

EXPOSE 8000

ENTRYPOINT ["/bin/sh", "/entrypoint.sh"]
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
