#!/usr/bin/env bash

# The correct way to do this would be to use `mountpoint -q /u` but that command isn't on mingw.
if ! [[ -d '/u' ]]; then
	echo "fatal: Can't deploy if '/u' drive is not mounted" >&2
	exit 1
fi

echo "Deploying build/"

echo -e "\nThese files will be made public at https://people.tamu.edu/~mdavidson:"
# list all the files in the build/ folder, sort them by nesting level, and prepend "+"
find build -type f | awk -F/ '{print NF-1,$0}' | sort -n | cut -d' ' -f2- | sed 's|^|  + |'

echo -e "\nThese files will no longer be public and will be moved to /u/backup":
find /u/public_html -type f | awk -F/ '{print NF-1,$0}' | sort -n | cut -d' ' -f2- | sed 's|^|  - |'

echo
read -p "Are you sure you want to continue (y/n)? " -n 1
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
	echo "Aborting (no files modified)"
	exit 0
fi

cp -vr /u/public_html/* /u/backup && cp -vr build/* /u/public_html

if [[ $? -ne 0 ]]
then
	echo "Failed to deploy"
	exit 1
fi

echo -e "\nWebsite published; previous version saved in /u/backup"
