FROM python:3.10-slim

RUN mkdir /app
WORKDIR /app

COPY ./ /app

RUN apt-get -y update
RUN apt-get install -y wget
RUN apt-get install -y unzip 

RUN wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
RUN apt-get install -y ./google-chrome-stable_current_amd64.deb
RUN wget https://storage.googleapis.com/chrome-for-testing-public/128.0.6613.119/linux64/chromedriver-linux64.zip
RUN unzip chromedriver-linux64.zip
RUN mv chromedriver-linux64/chromedriver / 

RUN pip install -r requirements.txt 

COPY cleanup.sh /app/cleanup.sh
RUN chmod +x /app/cleanup.sh

CMD ["sh", "-c", "/app/cleanup.sh & python3 app.py"]