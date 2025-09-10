-- CreateTable
CREATE TABLE "UserToken" (
    "token" TEXT NOT NULL PRIMARY KEY,
    "method" TEXT NOT NULL DEFAULT 'auth',
    "userId" TEXT NOT NULL,
    CONSTRAINT "UserToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
