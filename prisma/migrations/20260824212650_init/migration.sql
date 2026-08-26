-- CreateTable
CREATE TABLE "Location" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "label" TEXT NOT NULL,
    "pincode" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "blinkitProfile" TEXT NOT NULL,
    "zeptoProfile" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "blinkitUrl" TEXT NOT NULL,
    "zeptoUrl" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "ScrapeRun" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "locationId" TEXT NOT NULL,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" DATETIME,
    "status" TEXT NOT NULL,
    CONSTRAINT "ScrapeRun_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "scrapeRunId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "brand" TEXT,
    "quantityRaw" TEXT,
    "quantityValue" REAL,
    "quantityUnit" TEXT,
    "price" REAL NOT NULL,
    "mrp" REAL,
    "imageUrl" TEXT,
    "rank" INTEGER NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    CONSTRAINT "Product_scrapeRunId_fkey" FOREIGN KEY ("scrapeRunId") REFERENCES "ScrapeRun" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProductMatch" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "scrapeRunId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "blinkitProductId" TEXT NOT NULL,
    "zeptoProductId" TEXT NOT NULL,
    "similarityScore" REAL NOT NULL,
    CONSTRAINT "ProductMatch_scrapeRunId_fkey" FOREIGN KEY ("scrapeRunId") REFERENCES "ScrapeRun" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ProductMatch_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ProductMatch_blinkitProductId_fkey" FOREIGN KEY ("blinkitProductId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ProductMatch_zeptoProductId_fkey" FOREIGN KEY ("zeptoProductId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE INDEX "ScrapeRun_locationId_status_idx" ON "ScrapeRun"("locationId", "status");

-- CreateIndex
CREATE INDEX "Product_scrapeRunId_categoryId_platform_idx" ON "Product"("scrapeRunId", "categoryId", "platform");

-- CreateIndex
CREATE INDEX "ProductMatch_scrapeRunId_categoryId_idx" ON "ProductMatch"("scrapeRunId", "categoryId");
