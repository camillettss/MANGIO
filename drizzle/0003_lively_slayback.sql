CREATE TABLE `foodBarcodes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`barcode` varchar(255) NOT NULL,
	`foodId` int NOT NULL,
	`userId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `foodBarcodes_id` PRIMARY KEY(`id`),
	CONSTRAINT `foodBarcodes_barcode_unique` UNIQUE(`barcode`)
);
