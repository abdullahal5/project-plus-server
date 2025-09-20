# -----------------------
# Stage 1: Build the app
# -----------------------
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Copy package files and install all dependencies (including dev)
COPY package*.json ./
RUN npm install

# Copy Prisma schema & generate client
COPY prisma ./prisma
RUN npx prisma generate

# Copy the rest of the source code
COPY . .

# Build NestJS
RUN npm run build


# -----------------------
# Stage 2: Run the app
# -----------------------
FROM node:20-alpine AS runner

WORKDIR /usr/src/app

# Install only production dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy Prisma client & build output
COPY --from=builder /usr/src/app/prisma ./prisma
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules

# Expose port
EXPOSE 5000

# Start app
CMD ["node", "dist/main.js"]
