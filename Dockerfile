# Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Копіюємо файли залежностей
COPY package*.json ./

# Встановлюємо залежності
RUN npm ci

# Копіюємо код застосунку
COPY . .

# Будуємо застосунок
RUN npm run build

# Production stage
FROM nginx:alpine

# Копіюємо збудований застосунок з попереднього етапу
COPY --from=build /app/dist /usr/share/nginx/html

# Опціонально: копіюємо власну nginx конфігурацію
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]