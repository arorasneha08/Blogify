# Blogger

Blogger is a full-stack blogging platform for writing, publishing, and
discovering blog posts. The project includes a rich-text editor, blog
search, likes, comments, notifications, and draft management.

## Live Demo
https://blogger-kappa-two.vercel.app/

## Features

-   Authentication with sign-in and sign-up flows
-   Create, edit, publish, and save blog posts as drafts
-   Rich-text editing with Editor.js
-   Upload banner images using the configured image-upload service
-   Search blogs and browse similar posts by tags
-   Like and comment on blog posts
-   View author profiles and profile images
-   Notifications for new activity
-   Responsive interface for different screen sizes

## Tech Stack

### Frontend

-   React and Vite
-   React Router
-   Tailwind CSS
-   Axios
-   Editor.js
-   React Hot Toast
-   React Icons

### Backend

-   Node.js and Express
-   MongoDB with Mongoose
-   JWT-based authentication

### Other tools and services

-   Configured image-upload service (AWS-related configuration may be
    used)
-   Google Fonts: Inter, Gelasio, and Edu QLD Hand

## Project Structure

The exact structure depends on your repository layout. A typical setup
might look like:

``` text
Blogger/
├── frontend/
│   ├── src/
│   │   ├── components/     # Navbar, editor, blog cards, comments, etc.
│   │   ├── pages/          # Blog pages and editor pages
│   │   ├── common/         # Shared utilities and animation components
│   │   └── App.jsx
│   └── package.json
└── backend/
    ├── models/             # MongoDB/Mongoose models
    ├── routes or server.js # Express API routes
    └── package.json
```

Update this tree to match your actual repository if your folder names
differ.

## Getting Started

### Prerequisites

-   Node.js and npm
-   MongoDB locally or through MongoDB Atlas
-   Credentials for any configured image-upload service

### 1. Clone the repository

``` bash
git clone <your-repository-url>
cd Blogger
```

Replace `<your-repository-url>` with your repository URL.

### 2. Install dependencies

Install dependencies in the frontend and backend directories. For
example:

``` bash
cd frontend
npm install

cd ../backend
npm install
```

Adjust directory names to match your project.

### 3. Configure environment variables

Create environment files for the frontend and backend, using the
variable names expected by your code.

#### Frontend `.env`

The frontend uses `VITE_SERVER_DOMAIN` as the backend API base URL:

``` env
VITE_SERVER_DOMAIN=http://localhost:3000
```

Change the URL or port if your backend runs elsewhere.

#### Backend `.env`

Example values:

``` env
MONGODB_URI=""
SECRET_KEY=""
AWS_SECRET_ACCESS_KEY=""
AWS_ACCESS_KEY=""
AWS_SDK_SUPPRESS_MAINTAINANCE_MODE_MESSAGE="1"
```

These are example variable names. Check your backend code for the exact
names it requires, including any image-upload credentials.

**Security:** Never commit real secrets, database credentials, private
keys, or production environment files. Add `.env` files to `.gitignore`.

### 4. Run the application

Start the backend in one terminal:

``` bash
cd backend
npm run dev
```

Start the frontend in another terminal:

``` bash
cd frontend
npm run dev
```

These commands assume both `package.json` files define a `dev` script.
Otherwise, use the scripts configured in your project.

Open the local URL printed by Vite in your browser.

## Typical Workflow

1.  Create an account or sign in.
2.  Select **Write** to start a blog post.
3.  Add a title, banner image, and body content.
4.  Save the post as a draft or proceed to publish.
5.  Search for posts and explore similar blogs.
6.  Interact with posts through likes and comments.
7.  Check notifications and manage posts through the relevant dashboard
    pages.

## API Configuration

The frontend sends requests to the backend using `VITE_SERVER_DOMAIN`.
Make sure it points to the running Express server and that the backend
allows requests from the frontend origin.

The application includes API operations for blog retrieval, searching,
creating or updating posts, comments, likes, and notifications. Refer to
the backend code for the exact endpoints.

## Troubleshooting

-   **API requests fail:** Check `VITE_SERVER_DOMAIN`, the backend port,
    and that the Express server is running.
-   **MongoDB connection fails:** Verify the connection string,
    credentials, and network access.
-   **Images do not upload:** Check the image-upload service
    configuration and credentials.
-   **Editor content does not save:** Confirm Editor.js initializes
    successfully and that `save()` is called on the Editor.js instance.
-   **Similar blog cards show zero likes:** Confirm the API response
    includes `activity.total_likes`.
-   **Environment changes do not apply:** Restart the relevant
    development server after changing environment variables.

## Contributing

1.  Create a branch for your change.
2.  Make and test your updates.
3.  Submit a pull request describing the change.

## License

No license has been specified. Add a `LICENSE` file and update this
section if you plan to distribute the project under a specific license.
