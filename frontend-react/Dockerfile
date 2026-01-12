
FROM node:18-alpine AS build
WORKDIR /app


COPY package.json package-lock.json ./
RUN npm install


COPY . .
RUN npm run build


FROM nginx:stable-alpine
# 80번용 설정 파일을 복사합니다.
COPY default.conf /etc/nginx/conf.d/default.conf
# 빌드 결과물 복사
COPY --from=build /app/dist /usr/share/nginx/html


EXPOSE 80


CMD ["nginx", "-g", "daemon off;"]