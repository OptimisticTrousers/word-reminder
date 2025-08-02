#!/bin/bash

cd ../common 
npm install 
npm run build
cd ../server
npm install
npm run seed

