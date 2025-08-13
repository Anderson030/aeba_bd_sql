This project is a simple API built with Express.js
that connects to a Supabase Postgr database to provide
reports such as total payments per customer, outstanding invoices,
and transactions per payment platform.

“I tested the API using the frontend and browser requests, without Postman.”
----------------------------------------------------------------------------------------------------------------------------

Database Normalization
This project applies database normalization up to Third Normal Form (1NF, 2NF, and 3NF).

1NF (First Normal Form): All columns in the table contain atomic (indivisible) values, and there are no repeating groups.

2NF (Second Normal Form): All non-key attributes are completely dependent on the table's primary key, avoiding partial dependencies.

3NF (Third Normal Form): All attributes depend solely on the primary key, eliminating any transitive dependencies.

-----------------------------------------------------------------------------------------------------------------------------
Database Description

This project uses a standardized database hosted on Supabase:

Customers: Stores customer information such as first name, last name, ID, date of birth, phone number, and email.

Invoices: Stores invoice details, including invoice ID, customer ID, amount, due date, and status.

Payments: Stores payment transactions, including payment ID, invoice ID, amount, payment date, and platform.
----------------------------------------------------------------------------------------------------------------------------
Project Structure

Project Structure
The project is organized into the following main folders and files:

server/ – Contains the application's backend code.

db.js – Configures the connection to the Supabase database.

index.js – Main server file that launches the Express application and loads routes.

routes/ – Contains different route files for each API module.

clients.js – CRUD operations for clients.

invoices.js – CRUD operations for invoices.

payments.js – CRUD operations for payments.

reports.js – Endpoints for reports, such as total payments, outstanding invoices, and transactions by platform.

import.js – Manages the import of CSV files into the database.

web/ – Contains the frontend portion of the project.

index.html – Main HTML page for testing and interacting with the API.

css/ – Stylesheets for the frontend portion.

js/ – JavaScript files for frontend functionality.

.env – Environment variables (not shared in the repository) used to configure the Supabase connection and server port.

package.json – Lists the project's dependencies and scripts.
---------------------------------------------------------------------------------------------------------------------------------
Features:

Total Paid by Customer: Shows the amount paid by each customer.

Pending Invoices: Shows invoices pending payment.

Transactions by Platform: Shows transactions filtered by payment platform.

Supabase Integration: Use the Supabase client to query tables and views.
----------------------------------------------------------------------------------------------------------------------------

Technologies Used

Node.js – JavaScript runtime.
Express – Backend framework.
Supabase – Cloud database and API.
Dotenv – Environment variables management.
CORS – Allow cross-origin requests.
HTML, CSS, JavaScript – Frontend.
---------------------------------------------------------------------------------------------------------------------------

Installation
Make sure you have Node.js (latest LTS version) installed.

Clone the repository:
git clone (URL-REPOSITORY)
cd (FOLDER)

INSTALL DEPENDENCES
npm install
Configure .env:
Add the port
URL
ANON KEY

Example:

SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-api-key
PORT=4000

START SERVER 

NPM RUN SRTART OR NPM START

"AND OPEN OR RUN INDEX.HTML WHIT LIVE SERVER"
----------------------------------------------------------------------------------------------------------------------------

API Endpoints

Clients (/api/clients)
GET / – List all clients.
GET /:id – Get one client
POST / – Create a new client.
PUT /:id – Update a client.
DELETE /:id – Delete a client.

Invoices (/api/invoices)

Similar CRUD operations for invoices.
Payments (/api/payments)
CRUD operations for payments.
Reports (/api/reports)
GET /total-paid-by-client – List how much each client has paid.
GET /pending-invoices – Show invoices that are still unpaid.
GET /transactions-by-platform?platform=Nequi – Filter transactions by payment platform.

Import (/api/import)
Import data from CSV files.
-------------------------------------------------------------------------------------------------------------------------------------------------------
Limitations and Future Improvements
No authentication is implemented.

No role-based access control is available.

Possible integration with a more complete admin panel in the future.
--------------------------------------------------------------------------------------------------------------------------------------------------------


AUTOR 
Anderson Estiduar Blandón Alvarez

CLAN
GOSLING












