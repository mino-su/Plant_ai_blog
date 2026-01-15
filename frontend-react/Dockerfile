
FROM node:20-alpine


WORKDIR /app


COPY package*.json ./


RUN npm install


COPY . .


EXPOSE 5173


CMD ["npm", "run", "dev"]


EXPOSE 80


CMD ["nginx", "-g", "daemon off;"]