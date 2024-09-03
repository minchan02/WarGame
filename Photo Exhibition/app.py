import os
from flask import Flask, request, render_template, send_from_directory
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
import urllib

app = Flask(__name__)

UPLOAD_FOLDER = './static/images'
ALLOW_EXTENSION = {'jpg', 'png', 'svg'}

FLAG="FLAG{sample_file}"


def read_url(url, cookie={"name": "name", "value": "value"}):
    cookie.update({"domain": "127.0.0.1"})
    try:
        service = Service(executable_path="/chromedriver")
        options = webdriver.ChromeOptions()
        for _ in [
            "headless",
            "window-size=1920x1080",
            "disable-gpu",
            "no-sandbox",
            "disable-dev-shm-usage",
        ]:
            options.add_argument(_)
        driver = webdriver.Chrome(service=service, options=options)
        driver.implicitly_wait(3)
        driver.get("http://127.0.0.1:8000/")
        driver.add_cookie(cookie)
        driver.get(url)
    except Exception as e:
        driver.quit()
        print(e)
        return False
    driver.quit()
    return True

def uploaded_file(param):
    url = f"http://127.0.0.1:8000/view/{urllib.parse.quote(param)}"
    return read_url(url, {"name":"FLAG", "value":FLAG})

def filter_path(path):
    filter_list = ['/', '..', '\\']
    for filtering in filter_list:
        if filtering in path:
            return False
    return True

@app.route('/')
def upload_form():
    return render_template('index.html',filename=None)

@app.route('/view/<filename>')
def view_file(filename):
    if not filter_path(filename):
        return '<script>alert("No Hack"); history.go(-1);</script>'
    
    if filename.lower().endswith('.svg'):
        try:
            filePath = os.path.join(UPLOAD_FOLDER, filename)

            with open(filePath, 'r') as f:
                for line in f:
                    if 'script' in line:
                        return '<script>alert("No script"); history.go(-1);</script>'
        
        except:
            return '<script>alert("Error! Invalid FILE"); history.go(-1);</script>'

    return send_from_directory(UPLOAD_FOLDER,filename)

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return '<script>alert("No File"); history.go(-1);</script>'
    
    file = request.files['file']
    if file.filename == '':
        return '<script>alert("No File"); history.go(-1);</script>'
    if file:
        filename =file.filename
        if filename.rsplit('.',1)[1].lower() in ALLOW_EXTENSION:
            file.save(os.path.join(UPLOAD_FOLDER,filename))
            return render_template('index.html',filename=filename)
        else:
            return '<script>alert("Only Image files can be uploaded"); history.go(-1);</script>'
    else:
        return '<script>alert("No File"); history.go(-1);</script>'

@app.route('/report', methods=['GET'])
def report():
    return render_template('report.html')

@app.route('/report', methods=['POST'])
def check_image():
    filename = request.form.get('name')

    if uploaded_file(filename):
        return '<script>alert("Success!");history.go(-1);</script>'
    else:
        return '<script>alert("Fail!");history.go(-1);</script>'


if __name__ == "__main__":
    app.run('0.0.0.0', port=8000)