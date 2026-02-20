# specialized instructions about deployment.

## Deployment Checklist 

> [!IMPORTANT]
> The application will fail to start if it cannot connect to MongoDB. You MUST configure the `MONGO_URI` environment variable as described below.

### 1. MongoDB Atlas Connection
- Log in to your MongoDB Atlas dashboard.
- Navigate to your Cluster -> "Connect" -> "Drivers".
- Copy the connection string. It should look like `mongodb+srv://<username>:<password>@cluster0.mongodb.net/?retryWrites=true&w=majority`.
- Ensure you replace `<password>` with your actual database user password.

### 2. Render Environment Variables
- Go to your Render Dashboard -> "Environment".
- Add the following Environment Variables:

| Variable | Value (Example) | Description |
| :--- | :--- | :--- |
| `MONGO_URI` | `mongodb+srv://cheranit23_db_user:cheran0308@cluster0.jwiz8pu.mongodb.net/?appName=Cluster0` | **Required.** Your MongoDB Atlas connection string. |
| `NODE_ENV` | `production` | **Required.** Ensure production mode. |
| `JWT_SECRET` | `your_secure_secret` | **Required.** Secret for JWT signing. |
| `ADMIN_EMAIL` | `cheran@it23` | Email for the default admin account. |
| `ADMIN_PASSWORD` | `cheran@0308` | Password for the default admin account. |

### 3. Verify Deployment
- Trigger a manual deploy in Render after setting these variables.
- Check the logs. You should see a message: `Connecting to MongoDB with URI: mongodb+srv://...:****@...` followed by `MongoDB Connected`.
