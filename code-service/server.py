from flask import Flask
app = Flask(__name__)

@app.route('/ping')
def pong():
    return "pong"

if __name__ == '__main__':
    app.run()
