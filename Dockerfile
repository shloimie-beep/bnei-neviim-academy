FROM node:20-alpine
WORKDIR /app
COPY public/ ./public/
RUN npm install -g serve
EXPOSE 8080
CMD ["serve", "public", "-l", "8080"]
