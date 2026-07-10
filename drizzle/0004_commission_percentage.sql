ALTER TABLE `transactions` ADD `commission_percentage_bps` integer;
ALTER TABLE `transactions` ADD `brokerage_split_bps` integer DEFAULT 3000;
ALTER TABLE `transactions` ADD `gross_commission_amount_cents` integer;
ALTER TABLE `transactions` ADD `brokerage_fee_amount_cents` integer;
ALTER TABLE `transactions` ADD `agent_net_commission_cents` integer;
