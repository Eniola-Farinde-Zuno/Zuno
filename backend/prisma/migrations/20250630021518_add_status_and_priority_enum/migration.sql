/*
  Warnings:

  - The `status` column on the `Task` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `priority` on the `Task` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "status" AS ENUM ('NONE', 'IN_PROGRESS', 'COMPLETED', 'CLOSED', 'BLOCKED');

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "status",
ADD COLUMN     "status" "status" NOT NULL DEFAULT 'NONE',
DROP COLUMN "priority",
ADD COLUMN     "priority" "priority" NOT NULL;
