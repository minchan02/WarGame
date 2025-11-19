from flask import Flask, send_from_directory, render_template, Response

app = Flask(__name__, static_url_path='', static_folder='static')

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/get_flag')
def flag():
    KEYS = [11, 29, 37, 45, 53, 61, 77, 89, 101, 127]
    FLAG = "KMU{th@nks_t2_f1x_k00kmin_r0b8t!!}"

    def xor_hex_encrypt(s: str, k: int) -> str:
        return "".join(f"{ord(c) ^ k:02x}" for c in s)

    cipher = FLAG
    for k in KEYS:
        cipher = xor_hex_encrypt(cipher, k)
    return Response(cipher, mimetype="text/plain")

@app.route('/sup3r_s2cr3t_p4th')
def secret():
    return render_template('secret.html')

@app.route('/robots.txt')
def robots():
    return send_from_directory(app.static_folder,
                               'robots.txt',
                               mimetype='text/plain')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)
