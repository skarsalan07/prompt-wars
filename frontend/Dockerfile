# Stage 1: Build the React application
FROM node:22-alpine AS build

WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json* ./
RUN npm install

# Copy the rest of the source code
COPY . .

# Build the app
RUN npm run build

# Stage 2: Serve the app with Nginx
FROM nginx:alpine

# Copy custom nginx configuration if needed (optional)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built assets from the previous stage
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 8080 for Cloud Run
EXPOSE 8080

# Replace the default nginx port (80) with 8080
RUN sed -i 's/listen  *80;/listen 8080;/g' /etc/nginx/conf.d/default.conf

CMD ["nginx", "-g", "daemon off;"]
