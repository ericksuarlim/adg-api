FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --include=dev
COPY . .
EXPOSE 3000
CMD ["node", "dist/server.js"]



#FROM node:18-alpine
#
#WORKDIR /app
#COPY package*.json ./
#RUN npm install
#COPY . .
#
#EXPOSE 3000
#CMD ["node", "app.ts"]