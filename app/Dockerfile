FROM node:24-alpine
WORKDIR /app

# Créer le fichier flag à la racine (standard des labs CTF)
RUN echo "FLAG{d0ubl3_3xt3ns10n_byp4ss_1s_d4ng3r0us}" > /flag.txt && \
    chmod 644 /flag.txt

COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
