ALTER TABLE `transactions` ADD `commission_percentage_bps` integer;--> statement-breakpoint
ALTER TABLE `transactions` ADD `brokerage_split_bps` integer DEFAULT 3000;--> statement-breakpoint
ALTER TABLE `transactions` ADD `gross_commission_amount_cents` integer;--> statement-breakpoint
ALTER TABLE `transactions` ADD `brokerage_fee_amount_cents` integer;--> statement-breakpoint
ALTER TABLE `transactions` ADD `agent_net_commission_cents` integer;
