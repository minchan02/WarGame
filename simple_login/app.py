from flask import Flask, request, g
import sqlite3
import os

app = Flask(__name__)
DB = 'db.sqlite3'
WAF = ["admin", "or", "and", "=", " ", "(", ")", "/", "*", "|", "&"]

def get_db():
    if 'db' not in g:
        g.db = sqlite3.connect(DB)
    return g.db

@app.route('/')
def index():
    return "Try login : POST /login with username&password"

@app.route('/login', methods=['POST'])
def login():
    username = request.form.get('username','')
    password = request.form.get('password', '')
    
    if any(substr in username.lower() for substr in WAF):
        return "NoNo WAF enabled!"
    
    if any(substr in password.lower() for substr in WAF+['\'']):
        return "NoNo WAF enabled!"
        
    q = f"SELECT * FROM users WHERE name='{username}' and pw='{password}'"

    try:
        row = get_db().execute(q).fetchone()
        if not row:
            return f"Invalid credentials\n{q}"
        if row[1]:
            return f"Hello {row[1]}! Find admin password!\n{q}"

    except sqlite3.Error as e:
        return str(e), 500

@app.teardown_appcontext
def close_db(_):
    db = g.pop('db', None)
    if db: db.close()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
