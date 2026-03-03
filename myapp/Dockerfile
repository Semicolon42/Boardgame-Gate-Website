# Decide on base image
FROM node:24-alpine

# dfine the working directory for the docker container
WORKDIR /app

# copy requirements config over
COPY package.json .

# install the requirements
RUN npm install

# We install the seve command to serve a static file
RUN npm i -g serve

# copy all of the project files in
COPY . .

# Build the web application
RUN npm run build

# ?????? Define which port the application 'should' run on?  But not required to run on?
EXPOSE 3000

# Run the application with 'serve' command when the image is started
CMD [ "serve", "-s", "dist" ]