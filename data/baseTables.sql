DROP TABLE IF EXISTS boards, cards, statuses, users;

CREATE TABLE boards(
    id serial primary key,
    title varchar,
    creator_username varchar
);

CREATE TABLE cards(
    id serial primary key,
    board_id int,
    title varchar,
    status_id int,
    ord int
);

CREATE TABLE statuses(
    id serial primary key,
    title varchar

);

CREATE TABLE users (
    user_id serial PRIMARY KEY,
    username varchar,
    password varchar
);

INSERT INTO boards (id, title, creator_username)
VALUES
(default, 'board 1', 'public'),
(default, 'board 2', 'public');


INSERT INTO statuses(id, title)
VALUES
(default,'new'),
(default,'in progress'),
(default,'testing'),
(default,'done'),
(default,'new'),
(default,'in progress'),
(default,'testing'),
(default,'done');



INSERT INTO cards (id,board_id,title,status_id,ord)
VALUES
    (default,1,'new card 1',1,0),
    (default,1,'new card 2',1,1),
    (default,1,'in progress card',2,0),
    (default,1,'planning',3,0),
    (default,1,'done card 1',4,0),
    (default,1,'done card 1',4,1),
    (default,2,'new card 1',5,0),
    (default,2,'new card 2',5,1),
    (default,2,'in progress card',6,0),
    (default,2,'planning',7,0),
    (default,2,'done card 1',8,0),
    (default,2,'done card 1',8,1);
