from flask import Flask, redirect, jsonify, render_template, send_file, Response, request
from flask_cors import CORS
app = Flask(__name__)
CORS(app)

nonce = ''
flag =''

@app.route('/')
def index():
    return render_template('main.html')

@app.route('/nonce')
def non():
    global nonce
    nonce = request.args.get("nonce", "")
    return "1"

@app.route('/get_nonce')
def get_nonce():
    return nonce

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)