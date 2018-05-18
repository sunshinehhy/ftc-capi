* /story/:id
* /video/:id
* /gallery/:id

* /users/search?name=<name> | email=<email>
* /user/:uuid/
* /staff/:id

NOTE: `staff` data originally used `cmstmp01.managers`. I begin to experiement with a new table. See the schema in `sql-schema/backyard/staff.sql`

## Set up MySQL

Install MySQL.

Set up a user account (if not set during installation). An account is defined in terms of a user name and the client host or hosts from which the user can connect to the server.

Account name syntax: `'user_name'@'host_name'`

The default MySQL account is `root` with no password.

First connection to MySQL server as the `root` user: (Enter `mysql --help` in you terminal to see what those commands mean)
```
mysql --user=root mysql
```

Use account-management statement to create an account:
```sql
CREATE USER 'sampadm'@'localhost' IDENTIFIED BY 'secret';
```

The grant privileges:
```sql
GRANT ALL PRIVILEGES ON *.* TO 'sampadm'@'localhost' WITH GRANT OPTION;
```

To pupulate data, you have to use the `sql-schema` repo:

* Use MySQL to import all files under `legacy/sample-data`. They will set up tables and populate data in each table. Those tables are used for story, photo news and video.

* Then excute `npm run populate` to create `cmstmp01.userinfo` and `backyard.staff` tables. This command will also generate some ramdom data in those two tables.

## Learn the Basics to MySQL

To understand what you've done in the above step, read those docs:

* [Invoking MySQL Programs](https://dev.mysql.com/doc/refman/8.0/en/invoking-programs.html)
* [Connecting to the MySQL Server](https://dev.mysql.com/doc/refman/8.0/en/connecting.html)
* [Specifying Program Options](https://dev.mysql.com/doc/refman/8.0/en/program-options.html)
* [Using Options on the Command Line](https://dev.mysql.com/doc/refman/8.0/en/command-line-options.html)
* [Using Optino Files](https://dev.mysql.com/doc/refman/8.0/en/option-files.html)
* [Specify Account Names](https://dev.mysql.com/doc/refman/5.7/en/account-names.html)
* [Adding User Accounts](https://dev.mysql.com/doc/refman/5.7/en/adding-users.html)
* [CREATE USER Syntax](https://dev.mysql.com/doc/refman/5.7/en/create-user.html)
* [GRANT Syntax](https://dev.mysql.com/doc/refman/5.7/en/grant.html)

## MySQL Client Software

On Mac use [Sequel Pro](https://www.sequelpro.com/)