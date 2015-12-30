#!/bin/bash

####
# Script to remove too old Docker containers
#===
#
# This script removes all containers that were created
# more than X seconds ago.
#
# Codeboard's Mantra runs this script as a CRON job every
# few minutes to make sure we don't have any containers
# hanging around that e.g. were created but not started.
#
# Run this script: ./mantra_cron_rm_too_old_dockers.sh 1200
# (1200 means: delete containers created more than 1200 sec ago)
#
# Copyright: H.-Christian Estler
#
####

# Read the max allowed age for a container from the first argument
if [ -z "$1" ]; then
	echo "mantra_cron_rm_too_old_dockers.sh: No max_age argument provided. Using default of 30 minutes."
	MAX_AGE=1800
else
	MAX_AGE=$1
fi

# Get a string that concatenates for all containers the info: container_id;date_of_container_creation
# Example of a pair: e9b57753bd9a;2015-09-01 09:34:17 +0100 BST
# "Cut" removes the part about timezone (starting from '+') because we need to convert the date later
# on and can't do that as long as the time zone information is part of the string.
# Individual pairs of information are separated by newlines
ALL_CONTAINER_STRING=$(docker ps -a --format "{{.ID}};{{.CreatedAt}}" | cut -d '+' -f -1)

# Create an array from the string
readarray -t ALL_CONTAINER_ARRAY <<<"$ALL_CONTAINER_STRING"

# Get the current time as a UNIX time (seconds since 1970)
TIME=$(date +"%s")

# Based on current time we create a time stamp that's
# the threashold for containers to be considerdtoo old
TIMESTAMP=$(($TIME - $MAX_AGE))


# Loop over all the entries in the arrary
for i in "${ALL_CONTAINER_ARRAY[@]}"
do
   # Get the part of pair that has the container_id
   CONTAINER_ID=$(echo $i | cut -d ';' -f 1)

   # Get the part of the pair that has the date
   CONTAINER_CREATED=$(echo $i | cut -d ';' -f 2)

   # Convert the date into a Unix time stamp (seconds since 1970)
   CONTAINER_CREATED=$(date -d "$CONTAINER_CREATED" +"%s")

   # If CONTAINER_ID is not null and 
   # the time of container-creation is before the threashold, remove the container
   if [ -n "$CONTAINER_ID" ] && [ "$CONTAINER_CREATED" -le "$TIMESTAMP" ]; then
      # echo "Container is too old. Removing it."
      docker rm -f $CONTAINER_ID > /dev/null # redirect to /dev/null, otherwise rm prints the container id
   fi;

done
