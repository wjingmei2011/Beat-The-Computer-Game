# Use the official Node.js image as the base image
FROM node:latest

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Add debugging step to verify installed versions
RUN npm list connect-redis redis

# Copy the rest of the application code to the working directory
COPY . .

# Expose the port your application runs on
EXPOSE 4001

# Define the command to run your application
CMD ["npm", "start"]