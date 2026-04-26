# Deployment

This project has a FastAPI backend and a Vite React frontend. Deploy the backend first, then point the frontend at the backend URL.

## Backend on Render

1. Create a MongoDB Atlas database and copy its connection string.
2. Create a Render Web Service from this repo, or use the `render.yaml` blueprint.
3. Use these settings if creating the service manually:
   - Root Directory: `backend`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Set these environment variables:
   - `MONGODB_URL`
   - `DATABASE_NAME`
   - `GEMINI_API_KEY`
   - `SECRET_KEY`
   - `BACKEND_CORS_ORIGINS`

`BACKEND_CORS_ORIGINS` should include the deployed frontend origin, for example:

```text
https://your-app.vercel.app
```

For local development you can keep:

```text
http://localhost:5173
```

## Frontend on Vercel

1. Import the repo in Vercel.
2. Set the project root to `frontend`.
3. Use the default Vite settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Set this environment variable:
   - `VITE_API_BASE_URL=https://your-render-backend.onrender.com/api`

After Vercel deploys, copy the Vercel domain into the backend `BACKEND_CORS_ORIGINS` value and redeploy the backend.
