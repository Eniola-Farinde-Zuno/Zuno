-- CreateEnum
CREATE TYPE "size" AS ENUM ('NONE', 'EXTRA_SMALL', 'SMALL', 'MEDIUM', 'LARGE');

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "size" "size" NOT NULL DEFAULT 'NONE';
