CREATE TABLE `ai_extractions` (
	`id` text PRIMARY KEY NOT NULL,
	`transaction_id` text,
	`source_document_ids` text NOT NULL,
	`extracted_json` text NOT NULL,
	`confidence_score` integer,
	`status` text DEFAULT 'pending_review' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`transaction_id`) REFERENCES `transactions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `ai_extractions_transaction_id_idx` ON `ai_extractions` (`transaction_id`);--> statement-breakpoint
CREATE TABLE `documents` (
	`id` text PRIMARY KEY NOT NULL,
	`transaction_id` text,
	`file_name` text NOT NULL,
	`file_type` text NOT NULL,
	`file_size` integer NOT NULL,
	`storage_path` text NOT NULL,
	`document_type` text NOT NULL,
	`extracted_summary` text,
	`confidence_score` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`transaction_id`) REFERENCES `transactions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `documents_transaction_id_idx` ON `documents` (`transaction_id`);--> statement-breakpoint
ALTER TABLE `transactions` ADD `special_terms` text;--> statement-breakpoint
ALTER TABLE `transactions` ADD `seller_concessions` integer;--> statement-breakpoint
ALTER TABLE `transactions` ADD `closing_company` text;--> statement-breakpoint
ALTER TABLE `transactions` ADD `archived_at` integer;--> statement-breakpoint
ALTER TABLE `transactions` ADD `archive_reason` text;--> statement-breakpoint
ALTER TABLE `transactions` ADD `imported_from_document` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `transactions` ADD `import_confidence` integer;--> statement-breakpoint
ALTER TABLE `transactions` ADD `source_document_count` integer;