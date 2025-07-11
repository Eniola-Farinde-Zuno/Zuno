-- CreateTable
CREATE TABLE "_DependsOn" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_DependsOn_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_DependsOn_B_index" ON "_DependsOn"("B");

-- AddForeignKey
ALTER TABLE "_DependsOn" ADD CONSTRAINT "_DependsOn_A_fkey" FOREIGN KEY ("A") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DependsOn" ADD CONSTRAINT "_DependsOn_B_fkey" FOREIGN KEY ("B") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;
