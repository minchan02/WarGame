FROM php:7.3-apache 

WORKDIR /var/www/html

EXPOSE 80

COPY ./seed.txt /seed.txt
COPY ./flag /flag

COPY ./src/* /var/www/html/

RUN useradd -m user

RUN chmod 111 /flag

RUN chmod 444 /seed.txt

EXPOSE 80