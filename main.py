from flask import Flask, render_template, url_for, request, session, redirect, make_response, jsonify
from util import json_response

import data_handler

app = Flask(__name__)
app.secret_key = b'_5#y2L"F4Q8z\n\xec]/'


@app.route("/")
def index():
    """
    This is a one-pager which shows all the boards and cards
    """
    if 'username' in session:
        return render_template('index.html', username=session['username'])
    return render_template('index.html', username='')


@app.route("/get-boards")
@json_response
def get_boards():
    """
    All the boards
    """
    if 'username' in session:
        return data_handler.get_boards(session['username'])
    else:
        return data_handler.get_boards()


@app.route("/new-card-title", methods=['POST'])
@json_response
def rename_card_title():
    data = request.get_json()
    return data_handler.rename_card_title(data[0], data[1])


@app.route("/delete-column", methods=['POST'])
@json_response
def delete_column():
    data = request.get_json()
    return data_handler.delete_column(data[0], data[1])


@app.route("/dragged-card", methods=['POST'])
@json_response
def update_board():
    data = request.get_json()
    return data_handler.update_board(data[0], data[1])


@app.route("/new-board-name", methods=['POST'])
@json_response
def new_board_name():
    data = request.get_json()
    return data_handler.rename_board(data[0], data[1])


@app.route("/new-column-name", methods=['POST'])
@json_response
def new_column_name():
    data = request.get_json()
    return data_handler.rename_column(data[0], data[1], data[2])


@app.route("/get-cards/<int:board_id>")
@json_response
def get_cards_for_board(board_id: int):
    """
    All cards that belongs to a board
    :param board_id: id of the parent board
    """
    return data_handler.get_cards_for_board(board_id)


@app.route('/create-board', methods=['POST'])
@json_response
def create_board():
    board_json = request.get_json()
    board_name, username = board_json[0], board_json[1]
    if username != 'public' and 'username' in session:
        username = session['username']
        data_handler.save_new_board(board_name, username)
        return data_handler.get_boards(username)
    else:
        data_handler.save_new_board(board_name)
        if 'username' in session:
            return data_handler.get_boards(session['username'])
        else:
            return data_handler.get_boards()


@app.route("/get-columns/<int:board_id>")
@json_response
def get_columns(board_id: int):
    """
    All cards that belongs to a board
    :param board_id: id of the parent board
    """
    columns = data_handler.get_board_columns(board_id)
    return columns


@app.route('/register', methods=["GET", "POST"])
def register():
    if request.method == "GET":
        return render_template('register.html')
    if request.method == "POST":
        username = request.form["username"]
        password = request.form["password"]
        if not data_handler.check_for_username(username):
            data_handler.write_to_db(username, data_handler.hash_password(password))
            return redirect("/")
        else:
            return render_template('register.html', not_valid=True)


@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "GET":
        return render_template("login.html")
    if request.method == "POST":
        username = request.form["username"]
        password = request.form["password"]
        if data_handler.check_for_username(username):
            if data_handler.verify_password(password, data_handler.hash_password(password)):
                session['username'] = username
                redirect_to_index = redirect('/')
                response = make_response(redirect_to_index)
                response.set_cookie('username', value=username)
                return response
            else:
                return render_template("login.html", not_valid=True)
        else:
            return render_template("login.html", not_valid=True)


@app.route("/logout")
def logout():
    # remove the username from the session if it's there
    redirect_to_index = redirect('/')
    response = make_response(redirect_to_index)
    response.set_cookie('username', value="")
    session.pop('username', None)
    session.clear()
    return response


@app.route("/create-card/<int:board_id>", methods=["POST"])
@json_response
def create_card(board_id):
    card = request.get_json()
    data_handler.save_new_card(card)


@app.route("/add-column", methods=["POST"])
@json_response
def add_column():
    board_id = request.get_json()
    data_handler.add_column(board_id)


@app.route("/remove-card", methods=["POST"])
@json_response
def remove_card():
    card_id = request.get_json()
    board_id = data_handler.remove_card_by_id(card_id)
    return board_id[0]['board_id']


@app.route("/remove-board", methods=["POST"])
@json_response
def remove_board():
    board_id = request.get_json()
    data_handler.remove_board_by_id(board_id)
    if 'username' in session:
        return data_handler.get_boards(session['username'])
    else:
        return data_handler.get_boards()


def main():
    app.run(debug=True)
    # Serving the favicon
    with app.app_context():
        app.add_url_rule('/favicon.ico', redirect_to=url_for('static', filename='favicon/favicon.ico'))


if __name__ == '__main__':
    main()
