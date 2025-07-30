#! /bin/bash

# Download dataset
wget http://storage.googleapis.com/gresearch/refraw360/360_v2.zip
wget https://storage.googleapis.com/gresearch/refraw360/360_extra_scenes.zip

unzip 360_v2.zip -d mipnerf360
unzip 360_extra_scenes.zip -d mipnerf360

rm 360_v2.zip
rm 360_extra_scenes.zip

