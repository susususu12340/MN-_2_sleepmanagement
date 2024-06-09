#!/bin/sh

base_url=http://127.0.0.1:8000
name=Bot
message=Test

if [ ! "$1" = "" ] ; then
    name=$1
fi
if [ ! "$2" = "" ] ; then
    message=$2
fi
if [ ! "$3" = "" ] ; then
    base_url=$3
fi

while true ; do
    json="{ \"name\": \"$name\",
            \"message\": \"$message\",
            \"important\": false }"
    curl -X POST "$base_url/messages" \
         -H "accept: application/json" \
         -H "Content-Type: application/json" \
         -d "$json"
    echo
    sleep 3
done
