import json
from flask import Flask, request
from flask_cors import CORS
from flask_socketio import send, emit, SocketIO


app = Flask(__name__)
socketio = SocketIO(app)
CORS(app) # allow cross-origin

@app.route('/ping', methods=['GET'])
def pong():
    return "pong"

if __name__ == '__main__':
    socketio.run(app, port=9000)
    # app.run(debug=True, threaded=True, port=9000)

