-- Add showOnRoadmap field to Task
ALTER TABLE "Task" ADD COLUMN "showOnRoadmap" INTEGER NOT NULL DEFAULT 0;
