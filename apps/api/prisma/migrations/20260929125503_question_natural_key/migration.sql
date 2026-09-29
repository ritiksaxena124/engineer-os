-- AlterTable
ALTER TABLE "questions" ADD COLUMN     "slug" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "concept_terms" (
    "id" TEXT NOT NULL,
    "conceptId" TEXT NOT NULL,
    "term" TEXT NOT NULL,

    CONSTRAINT "concept_terms_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "concept_terms_conceptId_term_key" ON "concept_terms"("conceptId", "term");

-- CreateIndex
CREATE UNIQUE INDEX "questions_slug_key" ON "questions"("slug");

-- AddForeignKey
ALTER TABLE "concept_terms" ADD CONSTRAINT "concept_terms_conceptId_fkey" FOREIGN KEY ("conceptId") REFERENCES "concepts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

