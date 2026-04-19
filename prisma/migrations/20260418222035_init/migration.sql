-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT,
    "role" TEXT NOT NULL DEFAULT 'DISPATCHER',
    "companyId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "User_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "dotNumber" TEXT,
    "mcNumber" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zip" TEXT,
    "country" TEXT NOT NULL DEFAULT 'US',
    "phone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "logoUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Truck" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "unitNumber" TEXT NOT NULL,
    "make" TEXT,
    "model" TEXT,
    "year" INTEGER,
    "vin" TEXT,
    "licensePlate" TEXT,
    "licensePlateState" TEXT,
    "color" TEXT,
    "size" TEXT NOT NULL,
    "usageType" TEXT NOT NULL,
    "segment" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "loadCapacityLbs" REAL,
    "maxWeightLbs" REAL,
    "lengthFt" REAL,
    "widthFt" REAL,
    "heightFt" REAL,
    "distanceRange" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Truck_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TruckLicense" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "truckId" TEXT NOT NULL,
    "licenseType" TEXT NOT NULL,
    "licenseNumber" TEXT,
    "issuedBy" TEXT,
    "issuedAt" DATETIME,
    "expiresAt" DATETIME,
    "documentUrl" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TruckLicense_truckId_fkey" FOREIGN KEY ("truckId") REFERENCES "Truck" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Driver" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zip" TEXT,
    "licenseNumber" TEXT,
    "licenseState" TEXT,
    "licenseClass" TEXT,
    "licenseExpiry" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "hireDate" DATETIME,
    "terminationDate" DATETIME,
    "notes" TEXT,
    "assignedTruckId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Driver_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Driver_assignedTruckId_fkey" FOREIGN KEY ("assignedTruckId") REFERENCES "Truck" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contactName" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zip" TEXT,
    "country" TEXT NOT NULL DEFAULT 'US',
    "billingName" TEXT,
    "billingAddress" TEXT,
    "billingCity" TEXT,
    "billingState" TEXT,
    "billingZip" TEXT,
    "billingEmail" TEXT,
    "paymentTerms" TEXT,
    "creditLimit" REAL,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Client_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DispatchOrder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderNumber" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "truckId" TEXT,
    "driverId" TEXT,
    "clientId" TEXT,
    "originAddress" TEXT NOT NULL,
    "originCity" TEXT NOT NULL,
    "originState" TEXT NOT NULL,
    "originZip" TEXT,
    "originLat" REAL,
    "originLng" REAL,
    "destAddress" TEXT NOT NULL,
    "destCity" TEXT NOT NULL,
    "destState" TEXT NOT NULL,
    "destZip" TEXT,
    "destLat" REAL,
    "destLng" REAL,
    "distanceMiles" REAL,
    "pickupAt" DATETIME,
    "deliveryAt" DATETIME,
    "actualPickupAt" DATETIME,
    "actualDeliveryAt" DATETIME,
    "loadDescription" TEXT,
    "weightLbs" REAL,
    "pieces" INTEGER,
    "pallets" INTEGER,
    "hazmat" BOOLEAN NOT NULL DEFAULT false,
    "hazmatClass" TEXT,
    "specialInstructions" TEXT,
    "referenceNumber" TEXT,
    "rate" REAL,
    "rateType" TEXT NOT NULL DEFAULT 'FLAT',
    "fuelSurcharge" REAL,
    "totalCharge" REAL,
    "driverPay" REAL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DispatchOrder_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DispatchOrder_truckId_fkey" FOREIGN KEY ("truckId") REFERENCES "Truck" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "DispatchOrder_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "DispatchOrder_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DispatchStatusEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dispatchOrderId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "note" TEXT,
    "occurredAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DispatchStatusEvent_dispatchOrderId_fkey" FOREIGN KEY ("dispatchOrderId") REFERENCES "DispatchOrder" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_companyId_idx" ON "User"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "Company_dotNumber_key" ON "Company"("dotNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Company_mcNumber_key" ON "Company"("mcNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Truck_vin_key" ON "Truck"("vin");

-- CreateIndex
CREATE INDEX "Truck_companyId_idx" ON "Truck"("companyId");

-- CreateIndex
CREATE INDEX "Truck_status_idx" ON "Truck"("status");

-- CreateIndex
CREATE INDEX "TruckLicense_truckId_idx" ON "TruckLicense"("truckId");

-- CreateIndex
CREATE INDEX "TruckLicense_expiresAt_idx" ON "TruckLicense"("expiresAt");

-- CreateIndex
CREATE INDEX "Driver_companyId_idx" ON "Driver"("companyId");

-- CreateIndex
CREATE INDEX "Driver_status_idx" ON "Driver"("status");

-- CreateIndex
CREATE INDEX "Client_companyId_idx" ON "Client"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "DispatchOrder_orderNumber_key" ON "DispatchOrder"("orderNumber");

-- CreateIndex
CREATE INDEX "DispatchOrder_companyId_idx" ON "DispatchOrder"("companyId");

-- CreateIndex
CREATE INDEX "DispatchOrder_status_idx" ON "DispatchOrder"("status");

-- CreateIndex
CREATE INDEX "DispatchOrder_truckId_idx" ON "DispatchOrder"("truckId");

-- CreateIndex
CREATE INDEX "DispatchOrder_driverId_idx" ON "DispatchOrder"("driverId");

-- CreateIndex
CREATE INDEX "DispatchOrder_clientId_idx" ON "DispatchOrder"("clientId");

-- CreateIndex
CREATE INDEX "DispatchStatusEvent_dispatchOrderId_idx" ON "DispatchStatusEvent"("dispatchOrderId");
