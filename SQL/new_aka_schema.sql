CREATE DATABASE IF NOT EXISTS `asterion_aka`;
USE `asterion_dev`;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `ak_customers` CASCADE;
DROP TABLE IF EXISTS `ak_products` CASCADE;
DROP TABLE IF EXISTS `ak_hotkeys` CASCADE;
DROP TABLE IF EXISTS `ak_category` CASCADE;
DROP TABLE IF EXISTS `ak_productcategory` CASCADE;
DROP TABLE IF EXISTS `ak_eventtypes` CASCADE;
DROP TABLE IF EXISTS `ak_events` CASCADE;
DROP TABLE IF EXISTS `ak_eventprice` CASCADE;
DROP TABLE IF EXISTS `ak_eventtypeprice` CASCADE;
DROP TABLE IF EXISTS `ak_flowstand` CASCADE;
DROP TABLE IF EXISTS `ak_taploss` CASCADE;
DROP TABLE IF EXISTS `ak_sales` CASCADE;
DROP TABLE IF EXISTS `ak_usersales` CASCADE;
DROP TABLE IF EXISTS `ak_login` CASCADE;
DROP TABLE IF EXISTS `ak_session` CASCADE;
DROP TABLE IF EXISTS `ak_activesessions` CASCADE;
DROP TABLE IF EXISTS `ak_googleSessions` CASCADE;
DROP TABLE IF EXISTS `ak_groups` CASCADE;
DROP TABLE IF EXISTS `ak_customersAndGroups` CASCADE;
SET FOREIGN_KEY_CHECKS = 1;


CREATE TABLE `ak_customers` (
    `ID` varchar(255) NOT NULL UNIQUE,
    `Name` VARCHAR(255) NOT NULL,
    `BirthDate` DATE NOT NULL,
    `Bankaccount` varchar(34) NOT NULL UNIQUE,
    `Active` BOOLEAN DEFAULT 1,

    PRIMARY KEY(`ID`)
);


CREATE TABLE `ak_products` (
    `ID` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `Name` VARCHAR(255) NOT NULL UNIQUE,
    `Archived` TINYINT NOT NULL DEFAULT 0,
    PRIMARY KEY(`ID`)
);


CREATE TABLE `ak_hotkeys` (
    `ProductId` INT UNSIGNED NOT NULL UNIQUE,
    `Hotkey` VARCHAR(10) NOT NULL UNIQUE,

    PRIMARY KEY (`ProductID`, `Hotkey`),
    FOREIGN KEY (`ProductID`)
        REFERENCES `ak_products`(`ID`) ON DELETE CASCADE ON UPDATE CASCADE
);


CREATE TABLE `ak_category` (
    `ID` INT NOT NULL AUTO_INCREMENT,
    `Name` VARCHAR(255) UNIQUE,
    `Archived` TINYINT NOT NULL DEFAULT 0,
    PRIMARY KEY(`ID`)
);


CREATE TABLE `ak_productcategory` (
    `ProductID` INT UNSIGNED NOT NULL,
    `CategoryID` INT NOT NULL,

    PRIMARY KEY (`ProductID`, `CategoryID`),
    FOREIGN KEY (`ProductID`)
        REFERENCES `ak_products`(`ID`) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (`CategoryID`)
        REFERENCES `ak_category`(`ID`) ON DELETE CASCADE ON UPDATE CASCADE
);


CREATE TABLE `ak_eventtypes` (
    `ID` INT NOT NULL AUTO_INCREMENT,
    `Name` VARCHAR(255) UNIQUE,
    
    PRIMARY KEY(`ID`)
);


CREATE TABLE `ak_events` (
    `ID` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `Name` VARCHAR(255) NOT NULL,
    `EventTypeID` INT NOT NULL,
    `StartTime` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `EndTime` DATETIME DEFAULT NULL,
    `Saved` TINYINT NOT NULL DEFAULT 0,

    PRIMARY KEY (`ID`),
    FOREIGN KEY (`EventTypeID`)
        REFERENCES `ak_eventtypes`(`ID`) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE `ak_eventtypeprice` (
    `EventTypeID` INT NOT NULL,
    `ProductID` INT UNSIGNED NOT NULL,
    `UnitPrice` INT NOT NULL COMMENT "Price of the product in eurocents.",

    PRIMARY KEY (`EventTypeID`,`ProductID`),
    FOREIGN KEY (`ProductID`)
        REFERENCES `ak_products`(`ID`) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (`EventTypeID`)
        REFERENCES `ak_eventtypes`(`ID`) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE `ak_eventprice` (
    `EventID` INT UNSIGNED NOT NULL,
    `ProductID` INT UNSIGNED NOT NULL,
    `UnitPrice` INT NOT NULL COMMENT "Price of the product in eurocents.",

    PRIMARY KEY (`EventID`,`ProductID`),
    FOREIGN KEY (`ProductID`)
        REFERENCES `ak_products`(`ID`) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (`EventID`)
        REFERENCES `ak_events`(`ID`) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE `ak_flowstand` (
    `EventID`  INT UNSIGNED NOT NULL,
    `StartCount` DOUBLE NOT NULL,
    `EndCount` DOUBLE DEFAULT NULL,
		CONSTRAINT end_bigger
        CHECK(`StartCount` <= `EndCount`),

    PRIMARY KEY (`EventID`,`StartCount`),
	
    FOREIGN KEY (`EventID`)
        REFERENCES `ak_events`(`ID`) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE `ak_taploss` (
    `ID` INT NOT NULL AUTO_INCREMENT,
    `EventID`  INT UNSIGNED NOT NULL,
    `UsedVolume` DOUBLE DEFAULT NULL,
    `SoldVolume` DOUBLE DEFAULT NULL,

    PRIMARY KEY (`ID`),

    FOREIGN KEY (`EventID`)
        REFERENCES `ak_events`(`ID`) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE `ak_sales` (
    `EventID` INT UNSIGNED NOT NULL,
    `TimeSold` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `ProductID` INT UNSIGNED NOT NULL,
    `Amount` INT NOT NULL,

    PRIMARY KEY (`TimeSold`),

    FOREIGN KEY (`EventID`)
        REFERENCES `ak_events`(`ID`) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (`ProductID`)
        REFERENCES `ak_products`(`ID`) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE `ak_usersales` (
    `TimeSold` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `UserID` VARCHAR(255) NOT NULL,
    `TotalPrice` INT NOT NULL,

    PRIMARY KEY (`TimeSold`, `UserID`),
    
    FOREIGN KEY (`TimeSold`)
        REFERENCES `ak_sales`(`TimeSold`) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (`UserID`)
        REFERENCES `ak_customers`(`ID`) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE `ak_groups` (
	`ID` SERIAL,
    `name` VARCHAR(255),
    `active` INT
);

CREATE TABLE `ak_customersAndGroups` (
	`clubID` BIGINT UNSIGNED NOT NULL,
    `customerID` VARCHAR(255) NOT NULL,
    FOREIGN KEY (`clubID`)
        REFERENCES `ak_groups`(`ID`) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (`customerID`)
        REFERENCES `ak_customers`(`ID`) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE `ak_login` (
	`loginID` SERIAL,
    `Email` VARCHAR(255) NOT NULL UNIQUE,
    `Password` VARCHAR(255) NOT NULL,
    `Salt` VARCHAR(64) NOT NULL,
    
    PRIMARY KEY (`loginID`)
);

CREATE TABLE `ak_session` (
    `session_id` VARCHAR(255) NOT NULL UNIQUE,
    `expires` BIGINT NOT NULL,
    `data` VARCHAR(255) NOT NULL,
    PRIMARY KEY (`session_id`)
);

CREATE TABLE `ak_activesessions` (
	`sessionId` VARCHAR(255) NOT NULL UNIQUE,
    `loginID` BIGINT UNSIGNED NOT NULL,
    
    PRIMARY KEY (`sessionId`,`loginID`),
    FOREIGN KEY (`sessionId`)
        REFERENCES `ak_session`(`session_id`) ON DELETE CASCADE ON UPDATE CASCADE,
	FOREIGN KEY (`loginID`)
        REFERENCES `ak_login`(`loginID`) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE `ak_googleSessions` (
	`googleSession` VARCHAR(255) NOT NULL UNIQUE,
    `sessionId` VARCHAR(255) NOT NULL UNIQUE,
    
    PRIMARY KEY (`sessionId`,`googleSession`),
    FOREIGN KEY (`sessionId`)
        REFERENCES `ak_session`(`session_id`) ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT INTO ak_customers (ID, Name, BirthDate, Bankaccount, Active)
    values ('joris.kuiper','Joris', '2001-01-26', 'NL22INGB0123456789', True),
    ('alice.smith','Alice', '1988-06-2', 'NL12AMRO00112233445', True),
    ('bob.parker','Bob', '2003-12-01', 'NL22RABO0987654321', False);

INSERT INTO ak_products (Name, Archived)
    VALUES ('Bier Glas', 0),
    ('Bier Pul Nieuw', 0),
    ('Mixdrankje', 0),
    ('Bier Pul Oud', 1),
    ('Shotje', 0);

INSERT INTO ak_hotkeys (ProductID, Hotkey)
    VALUES (1, 'F1'),
    (2, 'P'),
    (3, 'F5');

INSERT INTO ak_category (Name)
    VALUES ('Populair'), 
    ('Mix en sterk');

INSERT INTO ak_productcategory (ProductID, CategoryID)
    VALUES (1,1),
    (2,1),
    (3,1),
    (4,1),
    (3,2),
    (5, 1);
INSERT INTO ak_eventtypes (Name)
    VALUES ('Afstudeerborrel'),
    ('Kroegavond'),
    ('NaTentamenFeest'),
    ('Naborrel');

INSERT INTO ak_events(Name, EventTypeID, StartTime, EndTime)
    VALUES ('Kroegavond 28-12-2021', 2, TIMESTAMP('2021-12-28 20:00'), TIMESTAMP('2021-12-29 03:00')),
    ('Kroegavond 30-12-2021', 2, TIMESTAMP('2021-12-30 20:00'), TIMESTAMP('2021-12-31 03:00')),
    ('Naborrel 28-12-2021', 4, TIMESTAMP('2021-12-29 03:00'), TIMESTAMP('2021-12-29 05:00')),
    ('Van isoleren naar escaleren; part two, electric boogaloo', 3, TIMESTAMP('2022-01-08 20:00'), TIMESTAMP('2022-01-09 06:00')),
    ('ASB Asterion', 1, TIMESTAMP('2022-02-05 20:00'), TIMESTAMP('2022-02-06 00:00'));

INSERT INTO ak_eventtypeprice(EventTypeID, ProductID, UnitPrice)
    VALUES (1, 1, 100),
    (1, 2, 200),
    (1, 3, 250),
    (1, 5, 180),
    (2, 1, 100),
    (2, 2, 200),
    (2, 3, 250),
    (2, 5, 180),
    (3, 1, 100),
    (3, 2, 200),
    (3, 3, 250),
    (3, 5, 150),
    (4, 1, 100),
    (4, 2, 200),
    (4, 3, 250),
    (4, 5, 180);

INSERT INTO ak_eventprice(EventID, ProductID, UnitPrice)
    VALUES (4, 1, 0),
    (4, 2, 0),
    (4, 5, 100),
    (5, 1, 0),
    (5, 2, 0);
    
INSERT INTO ak_login (email, Password, salt) VALUES ("joriskuiper2@gmail.com", "$2a$10$x/gH9ai66QWVnXgwEJFV.exmnAhRz7gjIMiPlgBLMdro5UYj/1/FW", "$2a$10$x/gH9ai66QWVnXgwEJFV.e");