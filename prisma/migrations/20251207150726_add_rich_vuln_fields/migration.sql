-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT,
    "password" TEXT,
    "image" TEXT,
    "role" TEXT NOT NULL DEFAULT 'VIEWER',
    "isOnboarded" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Vulnerability" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "cveId" TEXT,
    "cvssScore" REAL,
    "asset" TEXT,
    "affectedSystems" TEXT,
    "mitigations" TEXT,
    "references" TEXT,
    "attackVector" TEXT,
    "attackComplexity" TEXT,
    "privilegesRequired" TEXT,
    "impactAssessment" TEXT,
    CONSTRAINT "Vulnerability_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "content" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "vulnerabilityId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Comment_vulnerabilityId_fkey" FOREIGN KEY ("vulnerabilityId") REFERENCES "Vulnerability" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "details" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DreadScore" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "damage" REAL NOT NULL,
    "reproducibility" REAL NOT NULL,
    "exploitability" REAL NOT NULL,
    "affectedUsers" REAL NOT NULL,
    "discoverability" REAL NOT NULL,
    "total" REAL NOT NULL,
    "vulnerabilityId" TEXT NOT NULL,
    CONSTRAINT "DreadScore_vulnerabilityId_fkey" FOREIGN KEY ("vulnerabilityId") REFERENCES "Vulnerability" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StrideScore" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "spoofing" BOOLEAN NOT NULL,
    "tampering" BOOLEAN NOT NULL,
    "reputation" BOOLEAN NOT NULL,
    "informationDisclosure" BOOLEAN NOT NULL,
    "denialOfService" BOOLEAN NOT NULL,
    "elevationOfPrivilege" BOOLEAN NOT NULL,
    "vulnerabilityId" TEXT NOT NULL,
    CONSTRAINT "StrideScore_vulnerabilityId_fkey" FOREIGN KEY ("vulnerabilityId") REFERENCES "Vulnerability" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "DreadScore_vulnerabilityId_key" ON "DreadScore"("vulnerabilityId");

-- CreateIndex
CREATE UNIQUE INDEX "StrideScore_vulnerabilityId_key" ON "StrideScore"("vulnerabilityId");
