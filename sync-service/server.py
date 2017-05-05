import json
import bson
from flask import Flask, request
# from flask_uuid import FlaskUUID
from flask_pymongo import PyMongo
from uuid import uuid4
from bson.objectid import ObjectId
from flask_cors import CORS, cross_origin
from flask_socketio import send, emit, SocketIO

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app)
mongo = PyMongo(app)

"""
"""

# Set endpoint prefix to /v1 for initial API
# app.config["APPLICATION_ROOT"] = "/v1"

@app.route('/ping', methods=['GET'])
def pong():
    return "pong"

@app.route('/create-shared/<u1>/<u2>/<assignment>', methods=['POST'])
def create(u1, u2, assignment):
    #Create a new shared directory with path /shared/u1_u2_assignment
    dirname = u1 + "_" + u2 + "_" + assignment
    path = "/shared/" + dirname
    if (mongo.db.code.find_one({'path': path}) != None):
        return "file already exists"
    shared = mongo.db.code.find_one({'path': "/shared"})
    mongo.db.code.insert(
        {'name': dirname, 'children': [], 'contents': None, 'isDir': True, 'parent': shared['_id'],
         'path': path})
    newDir = mongo.db.code.find_one({'path': path})
    mongo.db.code.update({'_id': shared['_id']}, {"$addToSet": {'children': newDir['_id']}})
    return "success"

@app.route('/list-shared/<user>', methods=['GET'])
def getshared(user):
    #Return list of all shared directories belonging to user
    reg1 = user + '_.*'
    reg2 = '.*_' + user + '_.*'

    #TODO - fix this logic
    list1 = list(mongo.db.code.find({"name": {"$regex": reg1}}))
    list2 = list(mongo.db.code.find({"name": {"$regex": reg2}}))
    merged = []
    for i in list1:
        merged.append(i)
    for z in list2:
        if z not in merged:
            merged.append(z)

    if len(merged) == 0:
        return "User has no shared directories"
    loaded = []
    for directory in merged:
        # loaded.append({'rawSrc': None, 'fileName': directory['name'], 'isDir': True})
        loaded_dir = {'rawSrc': None, 'fileName': directory['name'], 'isDir': True}
        loaded_dir['children'] = []
        children = directory['children']
        for rid in children:
            doc = mongo.db.code.find_one({'_id': bson.ObjectId(oid=str(rid))})
            if len(doc) <= 0:
                continue
            if doc['isDir']:
                loaded_dir['children'].append({'rawSrc': None, 'fileName': doc['name'], 'isDir': True})
            else:
                loaded_dir['children'].append({'rawSrc':doc['contents'], 'fileName': doc['name'], 'isDir': False})
        loaded.append(loaded_dir)
    return json.dumps(loaded)

@socketio.on('code', namespace='/')
def on_code(payload,path):
    emit('code-sub',payload,namespace='/', broadcast=True)

if __name__ == '__main__':
    socketio.run(app, port=9000, debug=True)
