#!/bin/bash

sudo service mysql start 
echo "Enter root password for mysql : "
read -s password
mysql -u root -p$password -e "create database library";
mysql -u root -p$password library < setup/setup.sql;


echo "DB_PASS = $password" >> .env
