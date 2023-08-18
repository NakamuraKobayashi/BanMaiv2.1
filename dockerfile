# Base image
FROM node:16-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Bundle rest of the source code
COPY . .

# Environment variables
ENV BOT_TOKEN=MTE0MTE3NDA5ODE5MDQxMzkwNA.GD34WZ.I3AIa28W8H8QqNp1gd_jOFQEoBdEFSDaIkwJBM
ENV MONGO_CONNECTION=mongodb+srv://kenji:sakura@kenjidiscordbot.zx7fw.mongodb.net/test?retryWrites=true&w=majority
ENV ERROR_LOGS=
ENV JOIN_LEAVE_LOGS=
ENV BOT_SECRET=RA4i4IUB0XJEHRSccSB51Sl-h7ZBVEU9
ENV SESSION_PASSWORD=
ENV WEATHERSTACK_KEY=
ENV STRANGE_API_KEY=
ENV SPOTIFY_CLIENT_ID=4d9da29efebc44e782c6b168388cc231
ENV SPOTIFY_CLIENT_SECRET=74cf68fb292a4222a893729066938d9a

# Expose port 8080 for dashboard
EXPOSE 8080

# Define the command to run your Node.js application
CMD [ "node", "bot.js" ]
