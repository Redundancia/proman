from psycopg2.extras import RealDictCursor
import bcrypt
import persistence


@persistence.connection_handler
def get_boards(cursor: RealDictCursor, username='') -> list:
    """
    Gather all boards
    :return:
    """
    query = """
    SELECT *
    FROM boards
    WHERE boards.creator_username = %s OR boards.creator_username = 'public'
    ORDER BY id
    """
    cursor.execute(query, (username,))
    return cursor.fetchall()


@persistence.connection_handler
def create_default_cards(cursor: RealDictCursor, board_id, status_ids):
    query = """
    INSERT INTO cards (board_id, title, status_id, ord) 
    VALUES  (%s, 'new card', %s, 0),
            (%s, 'new card', %s, 0),
            (%s, 'new card', %s, 0),
            (%s, 'new card', %s, 0);
    """
    cursor.execute(query, (board_id, status_ids[0], board_id, status_ids[1], board_id, status_ids[2], board_id, status_ids[3]))


@persistence.connection_handler
def get_cards_for_board(cursor: RealDictCursor, board_id):
    query = """
            SELECT cards.id, board_id, cards.title, statuses.title AS status_title, statuses.id AS status_id, ord
            FROM cards
            INNER JOIN statuses on cards.status_id = statuses.id
            WHERE board_id=%s
            """
    cursor.execute(query, (board_id, ))
    return cursor.fetchall()


def hash_password(plain_text_password):
    # By using bcrypt, the salt is saved into the hash itself
    hashed_bytes = bcrypt.hashpw(plain_text_password.encode('utf-8'), bcrypt.gensalt())
    return hashed_bytes.decode('utf-8')


def verify_password(plain_text_password, hashed_password):
    hashed_bytes_password = hashed_password.encode('utf-8')
    return bcrypt.checkpw(plain_text_password.encode('utf-8'), hashed_bytes_password)


@persistence.connection_handler
def get_users(cursor: RealDictCursor):
    query = """
            SELECT username, password
            FROM users
            """
    cursor.execute(query);
    return cursor.fetchall()


@persistence.connection_handler
def check_for_username(cursor: RealDictCursor, username):
    query = """
            SELECT username
            FROM users
            WHERE username=%s
            """
    cursor.execute(query, (username,))
    result = cursor.fetchall()
    return False if result == [] else True


@persistence.connection_handler
def write_to_db(cursor: RealDictCursor, username, password):
    query = """
            INSERT INTO users (user_id, username, password)
            VALUES (DEFAULT, %s, %s)
            """
    cursor.execute(query, (username, password))


@persistence.connection_handler
def save_new_board(cursor: RealDictCursor, new_board_name, username='public'):
    query = """
            INSERT INTO statuses (id, title)
            VALUES  (DEFAULT, 'new'),
                    (DEFAULT, 'in progress'),
                    (DEFAULT, 'testing'),
                    (DEFAULT, 'done')
            RETURNING id;
            """
    cursor.execute(query)
    statuses_id = cursor.fetchall()
    status_ids = [status_id['id'] for status_id in statuses_id]
    query = """
            INSERT INTO boards (id, title, creator_username)
            VALUES (DEFAULT, %s, %s)
            RETURNING id
            """
    cursor.execute(query, (new_board_name, username))
    board_id = cursor.fetchall()[0]['id']
    create_default_cards(board_id, status_ids)


@persistence.connection_handler
def get_board_columns(cursor: RealDictCursor, board_id):
    query = """
           SELECT statuses.title, statuses.id
                FROM cards
                INNER JOIN statuses on cards.status_id = statuses.id
                WHERE board_id=%s
                GROUP BY statuses.title, statuses.id
                ORDER BY statuses.id;
            """
    cursor.execute(query, (board_id, ))
    return cursor.fetchall()


@persistence.connection_handler
def update_board(cursor: RealDictCursor, card_id, status_id):
    query = """
                UPDATE cards
                SET status_id=(
                    SELECT id FROM statuses WHERE id=%s)
                WHERE id=%s;
            """
    cursor.execute(query, (status_id, card_id))


@persistence.connection_handler
def save_new_card(cursor: RealDictCursor, card):
    query = """
            INSERT INTO cards (id, board_id, title, status_id, ord)
            VALUES (DEFAULT, %s, %s, %s, %s)
            """
    cursor.execute(query, (card["boardId"], card["title"], card["statusId"], card["order"]))


@persistence.connection_handler
def rename_board(cursor: RealDictCursor, board_id, new_board_name):
    query = """
                UPDATE boards
                SET title = %s
                WHERE id = %s;
            """
    cursor.execute(query, (new_board_name, board_id))


@persistence.connection_handler
def rename_column(cursor: RealDictCursor, new_column_name, status_id, board_id):
    query = """
        UPDATE statuses
        SET title = %s
        FROM boards
        WHERE statuses.id = %s AND boards.id = %s;
            """
    cursor.execute(query, (new_column_name, status_id, board_id))


@persistence.connection_handler
def rename_card_title(cursor: RealDictCursor, card_id, new_card_title):
    query = """
               UPDATE cards 
               SET title= %s
               WHERE id=%s
        """
    cursor.execute(query, (new_card_title, card_id))

    
@persistence.connection_handler
def remove_card_by_id(cursor: RealDictCursor, card_id):
    query = """
            DELETE FROM cards
            WHERE id=%s
            RETURNING board_id
            """
    cursor.execute(query, (card_id, ))
    return cursor.fetchall()


@persistence.connection_handler
def remove_board_by_id(cursor: RealDictCursor, board_id):
    query = """
            DELETE FROM cards WHERE board_id=%s;
            DELETE FROM boards WHERE id=%s;
            """
    cursor.execute(query, (board_id, board_id))


@persistence.connection_handler
def add_column(cursor: RealDictCursor, board_id):
    query = """
            INSERT INTO statuses (id, title)
            VALUES (DEFAULT, 'new column')
            RETURNING id
            """
    cursor.execute(query)
    column_id = cursor.fetchall()[0]['id']
    query = """
            INSERT INTO cards (board_id, title, status_id, ord)
            VALUES (%s, 'new card', %s, 0)
            """
    cursor.execute(query, (board_id, column_id))


@persistence.connection_handler
def delete_column(cursor: RealDictCursor, status_id, board_id):
    query = """
            DELETE FROM statuses WHERE id=%s;
            """
    cursor.execute(query, (status_id,))
