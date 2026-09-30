-- CreateEnum
CREATE TYPE "MediaKind" AS ENUM ('photo', 'archival', 'satellite', 'document');

-- CreateTable
CREATE TABLE "Media" (
    "id" TEXT NOT NULL,
    "file" TEXT NOT NULL,
    "alt" TEXT NOT NULL,
    "caption" TEXT,
    "kind" "MediaKind" NOT NULL DEFAULT 'photo',
    "focal" TEXT,
    "maxWidth" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Region" (
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameBn" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "description" TEXT[],
    "character" TEXT[],
    "established" TEXT,
    "mediaIds" TEXT[],
    "capitalSlug" TEXT NOT NULL,

    CONSTRAINT "Region_pkey" PRIMARY KEY ("slug")
);

-- CreateTable
CREATE TABLE "City" (
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameBn" TEXT NOT NULL,
    "tagline" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "description" TEXT[],
    "landmarks" TEXT[],
    "facts" JSONB NOT NULL,
    "lon" DOUBLE PRECISION NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "ambient" TEXT NOT NULL,
    "mediaIds" TEXT[],
    "regionSlug" TEXT NOT NULL,

    CONSTRAINT "City_pkey" PRIMARY KEY ("slug")
);

-- CreateTable
CREATE TABLE "River" (
    "slug" TEXT NOT NULL,
    "geoId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameBn" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "course" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "description" TEXT[],
    "mediaIds" TEXT[],

    CONSTRAINT "River_pkey" PRIMARY KEY ("slug")
);

-- CreateTable
CREATE TABLE "RiverStop" (
    "id" SERIAL NOT NULL,
    "position" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "lon" DOUBLE PRECISION NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "mediaId" TEXT,
    "refKind" TEXT,
    "refSlug" TEXT,
    "riverSlug" TEXT NOT NULL,

    CONSTRAINT "RiverStop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HeritageSite" (
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameBn" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "description" TEXT[],
    "period" TEXT NOT NULL,
    "architecture" TEXT NOT NULL,
    "recognition" TEXT,
    "lon" DOUBLE PRECISION NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "mediaIds" TEXT[],
    "regionSlug" TEXT NOT NULL,

    CONSTRAINT "HeritageSite_pkey" PRIMARY KEY ("slug")
);

-- CreateTable
CREATE TABLE "NatureSpot" (
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameBn" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "description" TEXT[],
    "ecosystem" TEXT NOT NULL,
    "recognition" TEXT,
    "ambient" TEXT NOT NULL,
    "lon" DOUBLE PRECISION NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "mediaIds" TEXT[],
    "regionSlug" TEXT NOT NULL,

    CONSTRAINT "NatureSpot_pkey" PRIMARY KEY ("slug")
);

-- CreateTable
CREATE TABLE "Food" (
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameBn" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "description" TEXT[],
    "origin" TEXT NOT NULL,
    "season" TEXT,
    "category" TEXT NOT NULL,
    "lon" DOUBLE PRECISION NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "mediaIds" TEXT[],
    "regionSlug" TEXT NOT NULL,

    CONSTRAINT "Food_pkey" PRIMARY KEY ("slug")
);

-- CreateTable
CREATE TABLE "CultureItem" (
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameBn" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "description" TEXT[],
    "recognition" TEXT,
    "lon" DOUBLE PRECISION,
    "lat" DOUBLE PRECISION,
    "mediaIds" TEXT[],
    "regionSlug" TEXT,

    CONSTRAINT "CultureItem_pkey" PRIMARY KEY ("slug")
);

-- CreateTable
CREATE TABLE "TimelineEvent" (
    "slug" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "yearLabel" TEXT NOT NULL,
    "era" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "place" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "context" TEXT NOT NULL,
    "lon" DOUBLE PRECISION NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "mediaId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "palette" JSONB NOT NULL,
    "refKind" TEXT,
    "refSlug" TEXT,
    "heritageSlug" TEXT,

    CONSTRAINT "TimelineEvent_pkey" PRIMARY KEY ("slug")
);

-- CreateTable
CREATE TABLE "PersonStory" (
    "slug" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "roleBn" TEXT NOT NULL,
    "place" TEXT NOT NULL,
    "theme" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "story" TEXT NOT NULL,
    "lon" DOUBLE PRECISION NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "mediaId" TEXT NOT NULL,
    "editorial" BOOLEAN NOT NULL DEFAULT true,
    "regionSlug" TEXT NOT NULL,

    CONSTRAINT "PersonStory_pkey" PRIMARY KEY ("slug")
);

-- CreateTable
CREATE TABLE "Destination" (
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameBn" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "description" TEXT[],
    "layer" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "opened" TEXT,
    "lon" DOUBLE PRECISION NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "mediaIds" TEXT[],
    "regionSlug" TEXT NOT NULL,

    CONSTRAINT "Destination_pkey" PRIMARY KEY ("slug")
);

-- CreateTable
CREATE TABLE "Story" (
    "slug" TEXT NOT NULL,
    "chapter" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT[],
    "mediaIds" TEXT[],
    "refs" JSONB NOT NULL,

    CONSTRAINT "Story_pkey" PRIMARY KEY ("slug")
);

-- CreateTable
CREATE TABLE "Gallery" (
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "mediaIds" TEXT[],

    CONSTRAINT "Gallery_pkey" PRIMARY KEY ("slug")
);

-- CreateTable
CREATE TABLE "_CityRivers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CityRivers_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_CityHeritage" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CityHeritage_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_CityNature" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CityNature_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_CityFood" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CityFood_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "City_regionSlug_idx" ON "City"("regionSlug");

-- CreateIndex
CREATE UNIQUE INDEX "RiverStop_riverSlug_position_key" ON "RiverStop"("riverSlug", "position");

-- CreateIndex
CREATE INDEX "HeritageSite_regionSlug_idx" ON "HeritageSite"("regionSlug");

-- CreateIndex
CREATE INDEX "NatureSpot_regionSlug_idx" ON "NatureSpot"("regionSlug");

-- CreateIndex
CREATE INDEX "Food_regionSlug_idx" ON "Food"("regionSlug");

-- CreateIndex
CREATE INDEX "TimelineEvent_year_idx" ON "TimelineEvent"("year");

-- CreateIndex
CREATE INDEX "_CityRivers_B_index" ON "_CityRivers"("B");

-- CreateIndex
CREATE INDEX "_CityHeritage_B_index" ON "_CityHeritage"("B");

-- CreateIndex
CREATE INDEX "_CityNature_B_index" ON "_CityNature"("B");

-- CreateIndex
CREATE INDEX "_CityFood_B_index" ON "_CityFood"("B");

-- AddForeignKey
ALTER TABLE "City" ADD CONSTRAINT "City_regionSlug_fkey" FOREIGN KEY ("regionSlug") REFERENCES "Region"("slug") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiverStop" ADD CONSTRAINT "RiverStop_riverSlug_fkey" FOREIGN KEY ("riverSlug") REFERENCES "River"("slug") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HeritageSite" ADD CONSTRAINT "HeritageSite_regionSlug_fkey" FOREIGN KEY ("regionSlug") REFERENCES "Region"("slug") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NatureSpot" ADD CONSTRAINT "NatureSpot_regionSlug_fkey" FOREIGN KEY ("regionSlug") REFERENCES "Region"("slug") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Food" ADD CONSTRAINT "Food_regionSlug_fkey" FOREIGN KEY ("regionSlug") REFERENCES "Region"("slug") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CultureItem" ADD CONSTRAINT "CultureItem_regionSlug_fkey" FOREIGN KEY ("regionSlug") REFERENCES "Region"("slug") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimelineEvent" ADD CONSTRAINT "TimelineEvent_heritageSlug_fkey" FOREIGN KEY ("heritageSlug") REFERENCES "HeritageSite"("slug") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonStory" ADD CONSTRAINT "PersonStory_regionSlug_fkey" FOREIGN KEY ("regionSlug") REFERENCES "Region"("slug") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Destination" ADD CONSTRAINT "Destination_regionSlug_fkey" FOREIGN KEY ("regionSlug") REFERENCES "Region"("slug") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CityRivers" ADD CONSTRAINT "_CityRivers_A_fkey" FOREIGN KEY ("A") REFERENCES "City"("slug") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CityRivers" ADD CONSTRAINT "_CityRivers_B_fkey" FOREIGN KEY ("B") REFERENCES "River"("slug") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CityHeritage" ADD CONSTRAINT "_CityHeritage_A_fkey" FOREIGN KEY ("A") REFERENCES "City"("slug") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CityHeritage" ADD CONSTRAINT "_CityHeritage_B_fkey" FOREIGN KEY ("B") REFERENCES "HeritageSite"("slug") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CityNature" ADD CONSTRAINT "_CityNature_A_fkey" FOREIGN KEY ("A") REFERENCES "City"("slug") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CityNature" ADD CONSTRAINT "_CityNature_B_fkey" FOREIGN KEY ("B") REFERENCES "NatureSpot"("slug") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CityFood" ADD CONSTRAINT "_CityFood_A_fkey" FOREIGN KEY ("A") REFERENCES "City"("slug") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CityFood" ADD CONSTRAINT "_CityFood_B_fkey" FOREIGN KEY ("B") REFERENCES "Food"("slug") ON DELETE CASCADE ON UPDATE CASCADE;
