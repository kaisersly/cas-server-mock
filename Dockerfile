FROM node:16
COPY . /app
WORKDIR /app
RUN npm install
ENV PORT 3004
CMD node server.js --port ${PORT} --database ${DATABASE} --key ${KEY} --password ${PASSWORD}