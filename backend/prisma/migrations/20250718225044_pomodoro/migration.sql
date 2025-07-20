-- CreateTable
CREATE TABLE "Pomodoro" (
    "id" SERIAL NOT NULL,
    "focusCycle" INTEGER NOT NULL,
    "breakCycle" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Pomodoro_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Pomodoro" ADD CONSTRAINT "Pomodoro_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
