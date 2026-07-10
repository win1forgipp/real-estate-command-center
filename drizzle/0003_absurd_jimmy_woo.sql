ALTER TABLE `documents` ADD `import_session_id` text;--> statement-breakpoint
ALTER TABLE `documents` ADD `blob_url` text;--> statement-breakpoint
ALTER TABLE `documents` ADD `blob_pathname` text;--> statement-breakpoint
ALTER TABLE `documents` ADD `processing_status` text DEFAULT 'temporary' NOT NULL;--> statement-breakpoint
CREATE INDEX `documents_import_session_id_idx` ON `documents` (`import_session_id`);