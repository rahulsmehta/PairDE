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

@socketio.on('connect', namespace='/')
def on_connect():
    emit('code','foobar', namespace='/')

@socketio.on('code', namespace='/')
def on_code(payload,path):
    print payload
    emit('code-sub',payload,namespace='/')


@app.route('/emit', methods=['GET'])
def emit_code():
    emit('code','foobar', namespace='/')


if __name__ == '__main__':
    socketio.run(app, port=9000, debug=True)
    # app.run(debug=True, threaded=True, port=9000)

