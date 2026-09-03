-- DropTable
DROP TABLE "LoginAttempt";

-- CreateTable
CREATE TABLE "LoginAttempt" (
    "identifier" TEXT NOT NULL,
    "windowStart" TIMESTAMP(3) NOT NULL,
    "count" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LoginAttempt_pkey" PRIMARY KEY ("identifier","windowStart")
);
