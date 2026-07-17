-- AlterTable
ALTER TABLE "bookings" ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "bookings" ADD COLUMN "isGuest" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "bookings" ADD COLUMN "guestEmail" TEXT;

-- AlterTable
ALTER TABLE "bookings" ADD COLUMN "guestPhone" TEXT;

-- AlterTable
ALTER TABLE "bookings" ADD COLUMN "guestName" TEXT;

-- AlterTable
ALTER TABLE "bookings" ADD COLUMN "guestTitle" TEXT;

-- AlterTable
ALTER TABLE "bookings" ADD COLUMN "guestDateOfBirth" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "bookings" ADD COLUMN "guestGender" TEXT;

-- AlterTable
ALTER TABLE "bookings" ADD COLUMN "guestCountry" TEXT DEFAULT 'CM';
