# Ramin Gin Count

Gin Rummy score tracker for Kaille and Francis.

## Stack
- Express.js + Pug
- File-based storage (data.json)
- PM2 process manager

## Run locally
```bash
npm install
npm start
```
App runs on http://localhost:5400

## Deploy
Push to main/master triggers GitHub Actions deployment to gin.kapochamo.com.

Secrets required: `SSH_PRIVATE_KEY`, `SERVER_HOST`, `SERVER_USER`
