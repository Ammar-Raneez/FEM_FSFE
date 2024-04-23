FROM node:19-alpine3.16

# Create a folder and sub folders if it doesnt exist, change ownership recursively to the user:group node user and group
RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
WORKDIR home/node/app
COPY --chown=node:node package*.json ./
USER node
RUN npm install

# Copy the files while also setting the ownership
COPY --chown=node:node . .
EXPOSE 3000
CMD ["node", "app.js"]

