var mysql = require('mysql');
var dbconfig = require('../config/database');

var connection = mysql.createConnection(dbconfig.connection);

// connection.query('CREATE DATABASE ' + dbconfig.database);
// connection.query('use ' + dbconfig.database);

connection.query('\
CREATE TABLE `' + dbconfig.database + '`.`' + dbconfig.users_table + '` ( \
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT, \
    `username` VARCHAR(255) NOT NULL, \
    `email` VARCHAR(255) NOT NULL, \
    `password` CHAR(60) NOT NULL, \
    `sign_up_date` DATETIME NOT NULL, \
    `account_permissions` ENUM(`a`,`b`,`c`) NOT NULL DEFAULT `a`,\
    `email_activation` enum(`0`,`1`) NOT NULL DEFAULT `0`,\
    `first_name` CHAR(60) NOT NULL,\
    `last_name` CHAR(60) NOT NULL,\
    `preferences` VARCHAR(255) NOT NULL,\
            PRIMARY KEY (`id`), \
    UNIQUE INDEX `id_UNIQUE` (`id` ASC), \
    UNIQUE INDEX `username_UNIQUE` (`username` ASC) \
)');

console.log('Success: Database Created!');

connection.end();
