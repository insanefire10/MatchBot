# SQL Database setup
My implementation uses MySQL by Oracle. Here is the queries to run to setup the DB (make sure you are logged in and connected to the DB)
```
CREATE DATABASE discord;
USE discord;

create table user_stats(
    server_id VARCHAR(24),
    user_id VARCHAR(24),
    wins INT DEFAULT 0,
    losses INT DEFAULT 0
);
```