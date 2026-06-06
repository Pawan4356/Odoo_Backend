-- User Roles: 'Admin', 'Manager', 'Procurement Officer', 'Vendor'
CREATE TYPE user_role AS ENUM ('Admin', 'Manager', 'Procurement Officer', 'Vendor');
CREATE TYPE rfq_status AS ENUM ('Open', 'Closed', 'Completed');
CREATE TYPE quotation_status AS ENUM ('Pending', 'Approved', 'Rejected');
CREATE TYPE approval_status AS ENUM ('Pending', 'Approved', 'Rejected');
CREATE TYPE po_status AS ENUM ('Draft', 'Issued', 'Fulfilled');
CREATE TYPE invoice_status AS ENUM ('Draft', 'Sent', 'Paid');

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'Vendor',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE vendors (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    company_name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    phone VARCHAR(50),
    gst_details VARCHAR(100),
    category VARCHAR(100),
    status VARCHAR(50) DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE rfqs (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    deadline TIMESTAMP NOT NULL,
    status rfq_status DEFAULT 'Open',
    created_by INT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE rfq_items (
    id SERIAL PRIMARY KEY,
    rfq_id INT REFERENCES rfqs(id) ON DELETE CASCADE,
    product_name VARCHAR(255) NOT NULL,
    quantity INT NOT NULL,
    description TEXT
);

CREATE TABLE rfq_vendors (
    rfq_id INT REFERENCES rfqs(id) ON DELETE CASCADE,
    vendor_id INT REFERENCES vendors(id) ON DELETE CASCADE,
    PRIMARY KEY (rfq_id, vendor_id)
);

CREATE TABLE quotations (
    id SERIAL PRIMARY KEY,
    rfq_id INT REFERENCES rfqs(id) ON DELETE CASCADE,
    vendor_id INT REFERENCES vendors(id) ON DELETE CASCADE,
    delivery_timeline VARCHAR(255),
    notes TEXT,
    status quotation_status DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (rfq_id, vendor_id)
);

CREATE TABLE quotation_items (
    id SERIAL PRIMARY KEY,
    quotation_id INT REFERENCES quotations(id) ON DELETE CASCADE,
    rfq_item_id INT REFERENCES rfq_items(id) ON DELETE CASCADE,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) GENERATED ALWAYS AS (unit_price) STORED -- Will need to adjust to multiply by qty in app
);

CREATE TABLE approvals (
    id SERIAL PRIMARY KEY,
    target_type VARCHAR(50) NOT NULL, -- e.g., 'QUOTATION'
    target_id INT NOT NULL,
    manager_id INT REFERENCES users(id),
    status approval_status DEFAULT 'Pending',
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE purchase_orders (
    id SERIAL PRIMARY KEY,
    po_number VARCHAR(100) UNIQUE NOT NULL,
    quotation_id INT REFERENCES quotations(id),
    total_amount DECIMAL(15, 2) NOT NULL,
    status po_status DEFAULT 'Draft',
    created_by INT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE invoices (
    id SERIAL PRIMARY KEY,
    invoice_number VARCHAR(100) UNIQUE NOT NULL,
    purchase_order_id INT REFERENCES purchase_orders(id),
    total_amount DECIMAL(15, 2) NOT NULL,
    tax_amount DECIMAL(15, 2) NOT NULL,
    status invoice_status DEFAULT 'Draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE activity_logs (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    action VARCHAR(255) NOT NULL,
    target_type VARCHAR(50),
    target_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
