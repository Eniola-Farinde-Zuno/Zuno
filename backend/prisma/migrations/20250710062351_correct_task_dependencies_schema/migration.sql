/*
  Warnings:

  - You are about to drop the `_DependsOn` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_DependsOn" DROP CONSTRAINT "_DependsOn_A_fkey";

-- DropForeignKey
ALTER TABLE "_DependsOn" DROP CONSTRAINT "_DependsOn_B_fkey";

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "dependencies" INTEGER[];

-- DropTable
DROP TABLE "_DependsOn";
