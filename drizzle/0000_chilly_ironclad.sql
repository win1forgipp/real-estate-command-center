CREATE TABLE `contacts` (
	`id` text PRIMARY KEY NOT NULL,
	`contact_type` text NOT NULL,
	`first_name` text NOT NULL,
	`last_name` text NOT NULL,
	`company` text,
	`email` text,
	`phone` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `contacts_last_name_idx` ON `contacts` (`last_name`);--> statement-breakpoint
CREATE TABLE `deadlines` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`deadline_type` text NOT NULL,
	`due_date` integer NOT NULL,
	`status` text DEFAULT 'due_soon' NOT NULL,
	`completed` integer DEFAULT false NOT NULL,
	`completed_at` integer,
	`transaction_id` text NOT NULL,
	`notes` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`transaction_id`) REFERENCES `transactions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `deadlines_due_date_idx` ON `deadlines` (`due_date`);--> statement-breakpoint
CREATE TABLE `links` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`url` text NOT NULL,
	`link_type` text DEFAULT 'other' NOT NULL,
	`transaction_id` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`transaction_id`) REFERENCES `transactions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `notes` (
	`id` text PRIMARY KEY NOT NULL,
	`content` text NOT NULL,
	`note_scope` text NOT NULL,
	`transaction_id` text,
	`contact_id` text,
	`author_user_id` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`transaction_id`) REFERENCES `transactions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`contact_id`) REFERENCES `contacts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`author_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`priority` text DEFAULT 'medium' NOT NULL,
	`due_date` integer,
	`completed` integer DEFAULT false NOT NULL,
	`completed_at` integer,
	`assigned_user_id` text,
	`transaction_id` text,
	`contact_id` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`assigned_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`transaction_id`) REFERENCES `transactions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`contact_id`) REFERENCES `contacts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `tasks_due_date_idx` ON `tasks` (`due_date`);--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` text PRIMARY KEY NOT NULL,
	`transaction_type` text NOT NULL,
	`property_address` text NOT NULL,
	`city` text NOT NULL,
	`state` text NOT NULL,
	`zip` text NOT NULL,
	`purchase_price` integer,
	`closing_date` integer,
	`contract_date` integer,
	`earnest_money_amount` integer,
	`earnest_money_received` integer DEFAULT false NOT NULL,
	`transaction_status` text DEFAULT 'prospect' NOT NULL,
	`listing_side` integer DEFAULT false NOT NULL,
	`selling_side` integer DEFAULT false NOT NULL,
	`commission_expected` integer,
	`commission_received` integer,
	`lender_name` text,
	`attorney_name` text,
	`title_company` text,
	`mls_number` text,
	`assigned_user_id` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`assigned_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `transactions_status_idx` ON `transactions` (`transaction_status`);--> statement-breakpoint
CREATE INDEX `transactions_closing_date_idx` ON `transactions` (`closing_date`);--> statement-breakpoint
CREATE INDEX `transactions_property_address_idx` ON `transactions` (`property_address`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`role` text DEFAULT 'partner' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);