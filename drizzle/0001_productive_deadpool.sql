CREATE TABLE `foods` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`proteins` int NOT NULL,
	`carbs` int NOT NULL,
	`fats` int NOT NULL,
	`calories` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `foods_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mealListItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`mealListId` int NOT NULL,
	`foodId` int NOT NULL,
	`quantity` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `mealListItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mealLists` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`targetProteins` int,
	`targetCarbs` int,
	`targetFats` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `mealLists_id` PRIMARY KEY(`id`)
);
