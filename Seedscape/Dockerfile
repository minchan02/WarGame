FROM php:7.3-apache 

WORKDIR /var/www/html

EXPOSE 80

COPY ./seed.txt /seed.txt
COPY ./flag.txt /flag.txt

COPY . /var/www/html/

RUN rm /var/www/html/flag.txt

EXPOSE 80