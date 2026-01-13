## Contacts Manager

Simple full-stack Contacts Manager application with a Node.js + Express REST API, SQLite database, and a vanilla JS frontend.

### Project Overview

This project provides a minimal but complete CRUD contacts manager:

- Backend exposes a REST API at `/api/contacts` for managing contacts.
- Frontend is a single-page HTML/JS UI that consumes the API with `fetch` and updates the page without reloads.
- Contacts have validation on both frontend and backend (name, email, phone).
## AI
used Gemini Ai for faster development due to time constraint
### Tech Stack

- **Backend**: Node.js, Express
- **Database**: SQLite (via `sqlite3`)
- **Frontend**: HTML, CSS, Vanilla JavaScript (Fetch API)

### Project Structure

- `server.js` – Express server entry point
- `src/config/db.js` – SQLite connection
- `src/db/schema.sql` – Database schema
- `src/db/init.js` – Schema initialization
- `src/models/contactModel.js` – Data access layer
- `src/controllers/contactController.js` – Request/response logic
- `src/routes/contactRoutes.js` – `/api/contacts` routes
- `index.html`, `style.css`, `script.js` – Frontend UI

### Setup Instructions

1. **Clone or download** this repository into a local folder.
2. Open a terminal in the project root (e.g. `C:\Users\...\Kryoss`).
3. Install dependencies:

   ```bash
   npm install
   ```

4. Initialize the SQLite database (creates `contacts.db` and tables):

   ```bash
   npm run init-db
   ```

5. Start the backend server:

   ```bash
   npm start
   ```

   The API will be available at `http://localhost:3000`.

### API Endpoints

Base URL: `http://localhost:3000/api/contacts`

- **GET `/api/contacts`**
  - Returns all contacts (sorted by `created_at` descending).
  - Response: `200 OK`, body: `[{ id, name, email, phone, created_at, updated_at }, ...]`

- **GET `/api/contacts/:id`**
  - Returns a single contact by ID.
  - `400 Bad Request` if `id` is invalid.
  - `404 Not Found` if contact does not exist.

- **POST `/api/contacts`**
  - Creates a new contact.
  - Request body (JSON):

    ```json
    {
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "1234567890"
    }
    ```

  - Validation:
    - `name`, `email`, `phone` are required.
    - `email` must be a valid format.
    - `phone` must be 10–15 digits (after stripping non-digits).
    - `email` must be unique.
  - Responses:
    - `201 Created` with created contact.
    - `400 Bad Request` with `{ "errors": [...] }` for validation errors.
    - `409 Conflict` with `{ "error": "Email already exists" }` when duplicate.

- **PUT `/api/contacts/:id`**
  - Updates an existing contact.
  - Same validation rules as POST (applied to merged existing + new values).
  - Responses:
    - `200 OK` with updated contact.
    - `400 Bad Request` (invalid id or validation errors).
    - `404 Not Found` if contact does not exist.
    - `409 Conflict` if email conflicts with another contact.

- **DELETE `/api/contacts/:id`**
  - Deletes a contact by ID.
  - Responses:
    - `204 No Content` on success.
    - `400 Bad Request` if id is invalid.
    - `404 Not Found` if contact does not exist.

### Running the Frontend

1. Ensure the backend server is running on `http://localhost:3000`.
2. Open `index.html` directly in your browser (double-click the file or use “Open With > Browser”).
3. The page will:
   - Load contacts on page load.
   - Let you create, edit, and delete contacts without page refresh.
   - Show inline validation messages and toast-like success/error messages.
   - Support searching by name/email and sorting alphabetically.

### Code Quality Notes

- Backend code is separated into routes, controllers, and models for clarity.
- Input validation is implemented on both frontend and backend.
- Controllers use `async/await` with `try/catch` and delegate unexpected errors to Express’s global error handler.
- All API responses are JSON with clear messages and appropriate HTTP status codes.


