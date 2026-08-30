# MyloNex

MyloNex is a B2B textile sourcing platform prototype that connects
buyers with fabric suppliers. It provides a simple workflow for browsing
fabrics, reviewing specifications, submitting sample requests or bulk
RFQs, and managing inquiries and supplier quotations.

> **Demo project:** The credentials below are for the local/demo
> environment only. Do not use real production credentials in a public
> repository.

## Demo Credentials

### Buyer

-   **Email:** `buyer@test.com`
-   **Password:** `123456789`

### Supplier

-   **Email:** `supplier@test.com`
-   **Password:** `123456789`

## Features

### Authentication

-   Supabase email/password authentication
-   Separate Buyer and Supplier roles
-   Role-aware login
-   Invalid role/credential handling
-   Protected buyer and supplier workflows
-   Logout functionality

### Buyer

-   Browse the fabric catalog
-   Search fabrics by name, composition, and weave
-   Filter fabrics by production status
-   View detailed fabric specifications
-   View fabric images
-   Submit a sample request
-   Submit a bulk production RFQ
-   Specify quantity, target price, required dispatch date, and delivery
    location
-   View submitted inquiries

### Supplier

-   View incoming buyer inquiries
-   Manage inquiry workflow
-   Review and manage quotations

## Core Workflow

### Buyer workflow

1.  Log in as a Buyer.
2.  Browse the fabric catalog.
3.  Search or filter fabrics.
4.  Open a fabric to view its specifications.
5.  Select **Request Sample / Quote**.
6.  Submit either a Sample Request or Bulk Production RFQ.
7.  View the submitted inquiry from **My Inquiries**.

### Supplier workflow

1.  Log in as a Supplier.
2.  Open the supplier workspace.
3.  Review incoming inquiries.
4.  Manage quotations for buyer requests.

## Tech Stack

-   **Next.js** --- React framework and application routing
-   **TypeScript** --- Type-safe application development
-   **Tailwind CSS** --- UI styling
-   **Supabase** --- Authentication and PostgreSQL database
-   **Lucide React** --- Interface icons

## Project Structure

``` text
app/
├── buyer/
│   ├── catalog/
│   │   ├── page.tsx
│   │   └── [id]/
│   │       ├── page.tsx
│   │       └── inquiry/
│   │           └── page.tsx
│   └── inquiries/
├── supplier/
│   ├── inquiries/
│   └── quotes/
├── login/
└── page.tsx

components/
└── AppHeader.tsx

lib/
└── supabase.ts

public/
└── fabrics/
    ├── organic-cotton-poplin.jpg
    ├── indigo-yarn-dyed-check.jpg
    ├── bamboo-lyocell-satin.jpg
    └── heavyweight-canvas-greige.jpg
```

## Fabric Catalog

The demo catalog currently contains four fabrics:

-   Organic Cotton Poplin 40s
-   Indigo Yarn-Dyed Check Shirting
-   Bamboo Lyocell Blend Satin
-   Heavyweight Canvas Greige

Each fabric can contain:

-   Description
-   GSM
-   Weave
-   Composition
-   Width
-   Minimum order quantity (MOQ)
-   Production status
-   Dispatch timeline
-   Certifications
-   Fabric image

Fabric image paths are stored in Supabase and point to files under
`public/fabrics/`.

Example:

``` text
/fabrics/organic-cotton-poplin.jpg
```

## Database

The application uses Supabase tables for the core marketplace data.

### `fabrics`

Stores fabric catalog information such as:

-   `id`
-   `name`
-   `description`
-   `image_url`
-   `gsm`
-   `weave`
-   `composition`
-   `width`
-   `moq`
-   `production_status`
-   `dispatch_min_days`
-   `dispatch_max_days`
-   `certifications`

### `inquiries`

Stores buyer requests and RFQs, including:

-   Buyer
-   Fabric
-   Inquiry type
-   Requested quantity
-   Target price
-   Required dispatch date
-   Delivery location
-   Inquiry status

## Environment Variables

Create a `.env.local` file in the project root:

``` env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Do not commit `.env.local` or real production credentials to GitHub.

## Getting Started

### 1. Clone the repository

``` bash
git clone <your-repository-url>
cd <your-project-folder>
```

### 2. Install dependencies

``` bash
npm install
```

### 3. Configure Supabase

Create a Supabase project and add the required environment variables to
`.env.local`.

Make sure the demo users and required database tables are available in
the Supabase project.

### 4. Start the development server

``` bash
npm run dev
```

Open:

``` text
http://localhost:3000
```

## Demo Entry Point

The home page provides two demo roles:

-   **Continue as Buyer**
-   **Continue as Supplier**

Users are taken to the login flow and must authenticate with the
appropriate role credentials.

## UI & Design

MyloNex uses a clean B2B SaaS-style interface with:

-   Minimal black, white, and zinc-based color palette
-   Responsive layouts
-   Card-based catalog browsing
-   Clear status badges
-   Structured fabric specifications
-   Consistent navigation between buyer and supplier workspaces

## Current Scope

This project focuses on the core marketplace workflow rather than a
production-ready textile procurement system. The current implementation
demonstrates authentication, role-based access, fabric discovery,
inquiry creation, and supplier-side inquiry/quotation workflows.

## Future Improvements

Potential next steps include:

-   Supplier profiles and company information
-   Rich supplier quotation management
-   Buyer/supplier messaging
-   Inquiry status history
-   Sample tracking
-   Production and dispatch tracking
-   Notifications
-   File/document attachments
-   Advanced catalog filters
-   Image storage through Supabase Storage
-   Production-ready authorization and Row Level Security policies
-   Improved mobile navigation
-   Deployment and production environment configuration

## License

This project is a personal/demo project. Add an appropriate license here
if you plan to distribute the source code publicly.
