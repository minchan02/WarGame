from flask import Flask, request, render_template, send_file
import os

UPLOAD_FOLDER = 'uploads'

app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html")

@app.route('/load-file', methods=['GET'])
def load_file_view():
    filepath = request.args.get('filename', '')
    if not filepath:
        return render_template('load_file.html')
    filepaths = os.path.abspath(os.path.join(UPLOAD_FOLDER, filepath))

    if ".." in filepath:
        return "Malicious activity detected.", 401

    if not os.path.exists(filepaths):
        return "File does not exist!", 404

    return send_file(filepaths, as_attachment=False)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
