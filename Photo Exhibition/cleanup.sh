#!/bin/bash

while true
do
    find /app/static/images/* -type f ! -path '/app/static/images/main/*' -delete
    sleep 1800  # 30분 대기
done