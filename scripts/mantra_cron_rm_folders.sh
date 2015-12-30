#!/bin/bash

####
# Script to remove too old MantraId project folders
#===
#
# This script removes folders in /tmp/projects that were created
# more than X seconds ago.
#
# Codeboard's Mantra runs this script as a CRON job every
# few minutes to make sure we don't have many old project
# folders hanging around.
#
# Run this script: ./mantra_cron_rm_folders.sh 30 /tmp/projects
# (i.e.: delete folders in /tmp/projects that were created more than 30 min ago)
#
# Important: Mantra itself as a "maxLifetimeForMantraId" parameter. If a mantraId is
# older than that value, Mantra will automatically create a fresh MantraId. This script
# can thus safely delete folders that are older than "maxLifetimeForMantraId".
# So make sure to set the value for this script accordingly.
#
# Copyright: H.-Christian Estler
#
####

# Delete all the folders that were created more than 60 minutes ago; do it as the docker root-user (who created the folders)
# Note: the docker image must exists (of course)

# Read the max allowed age for folders (all folders older than that will be deleted)
if [ -z "$1" ]; then
	echo "mantra_cron_rm_folders.sh: No max_folder_age argument provided. Using default of 45 minutes."
	MAX_FOLDER_AGE=45;
else
	MAX_FOLDER_AGE=$1
fi

# Read the absolute path of the Mantra project folder
if [ -z "$2" ]; then
	echo "mantra_cron_rm_folders.sh: No project_folder argument provided. Using default of /tmp/projects."
	PROJECT_FOLDER="/tmp/projects"
else
	PROJECT_FOLDER=$2
fi

# Find all the folders in PROJECT_FOLDER that are older than MAX_FOLDER_AGE
# For all folders found, we execute the "rm" command
# We don't want any output so we redirect stdout and stderr to /dev/null
find $PROJECT_FOLDER/* -maxdepth 0 -mmin +$MAX_FOLDER_AGE -type d -exec rm -rf {} \; &> /dev/null
