import json
import bson
from flask import Flask, request
# from flask_uuid import FlaskUUID
from flask_pymongo import PyMongo
from uuid import uuid4
from bson.objectid import ObjectId
from flask_cors import CORS, cross_origin

app = Flask(__name__)
CORS(app)
# flask_uuid = FlaskUUID()
# flask_uuid.init_app(app)
mongo = PyMongo(app)

"""
TODO: Implement storage service with headless git repo
"""


# Set endpoint prefix to /v1 for initial API
# app.config["APPLICATION_ROOT"] = "/v1"

# Maintenance to do:
# 1) define a resource class
# 2) Create a new endpoints so that each call handles RID and filename
# 3) Add in error messages

# class Resource:
#   def __init__()


def getRoot():
    root = list(mongo.db.code.find({'path': "/"}))
    print root[0]["_id"]
    return root[0]["_id"]


def new_rid():
    return str(uuid4())


# Takes path to resource and returns RID from db
def getRID(pathtoresource):
    return pathtoresource


@app.route('/ping', methods=['GET'])
def pong():
    return "pong"


@app.route('/find/<rid>', methods=['GET'])
def find(rid):
    tstring = ObjectId(rid)
    target = list(mongo.db.code.find({'_id': tstring}))

    print tstring
    print rid
    print target
    print len(target)
    if len(target) == 0:
        return "failure"
    else:
        return "success"


@app.route('/root', methods=['GET'])
def root():
    root = list(mongo.db.code.find({'path': "/"}))
    return root[0]["_id"]


@app.route('/list-path', defaults={'path': ''})
@app.route('/list-path/', defaults={'path': ''})
@app.route('/list-path/<path:path>', methods=['GET'])
@cross_origin()
def list_path(path):
    path = '/' + path
    resource = mongo.db.code.find_one({'path': path})
    if resource['isDir'] == False:
        return "file has no members"
    else:
        return json.dumps(map(str, resource['children']))

@app.route('/list-full', defaults={'path': ''})
@app.route('/list-full/', defaults={'path': ''})
@app.route('/list-full/<path:path>', methods=['GET'])
@cross_origin()
def list_full(path):
    path = '/' + path
    resource = mongo.db.code.find_one({'path': path})
    if resource['isDir'] == False:
        return "file has no members"
    else:
        children = resource['children']
        loaded = []
        for rid in children:
            doc = mongo.db.code.find_one({'_id': bson.ObjectId(oid=str(rid))})
            if len(doc) <= 0:
                continue
            if doc['isDir']:
                loaded.append({'rawSrc': None, 'fileName': doc['name']})
            else:
                loaded.append({'rawSrc':doc['contents'], 'fileName': doc['name']})
        return json.dumps(loaded);


@app.route('/update-path', defaults={'path': ''})
@app.route('/update-path/', defaults={'path': ''})
@app.route('/update-path/<path:path>', methods=['POST'])
@cross_origin()
def update_path(path):
    data = json.loads(request.data)
    path = '/' + path
    rawpath = path
    splitpath = path.split('/')
    filename = splitpath[len(splitpath) - 1]
    parentPath = "/"
    for i in range(1, len(splitpath) - 1):
        parentPath += splitpath[i] + "/"
    parentPath = parentPath[:-1]
    if path == "":
        return "cannot modify root"
    else:
        print path
        file = mongo.db.code.find_one({'path': path})
        if file == None:
            return "no such file to update"

        mongo.db.code.update({'path': path}, {
            'name': filename,
            'children': [],
            'contents': data['contents'],
            'isDir': file['isDir'],
            'path': rawpath})
        return "success"


@app.route('/create-path', defaults={'path': ''})
@app.route('/create-path/', defaults={'path': ''})
@app.route('/create-path/<path:path>', methods=['POST'])
def create_path(path):
    data = json.loads(request.data)
    path = "/" + path
    rawpath = path
    splitpath = path.split('/')
    filename = splitpath[len(splitpath) - 1]
    parentPath = "/"
    for i in range(1, len(splitpath) - 1):
        parentPath += splitpath[i] + "/"
    parentPath = parentPath[:-1]

    if parentPath == "":
        parentId = root()
    else:
        parent = mongo.db.code.find_one({'path': parentPath})
        print parent
        if parent == None:
            return "no such folder"
        elif parent['isDir'] == False:
            return parent['name'] + " is not a folder"
        else:
            parentId = parent['_id']
    mongo.db.code.insert(
        {'name': filename, 'children': [], 'contents': data['contents'], 'isDir': data['isDir'], 'parent': parentId,
         'path': rawpath})
    child = mongo.db.code.find_one({'path': rawpath})
    mongo.db.code.update({'_id': parentId}, {"$addToSet": {'children': child['_id']}})

    return "success"


@app.route('/load-path', defaults={'path': ''})
@app.route('/load-path/', defaults={'path': ''})
@app.route('/load-path/<path:path>', methods=['GET'])
def load_path(path):
    print path
    path = '/' + path
    print path
    target = list(mongo.db.code.find({'path': path}))
    if len(target) == 0:
        return "not found"
    else:
        return target[0]['contents']


@app.route('/rename-path', defaults={'path': ''})
@app.route('/rename-path/', defaults={'path': ''})
@app.route('/rename-path/<path:path>', methods=['POST'])
def rename_path(path):
    data = json.loads(request.data)
    path = "/" + path
    rawpath = path
    splitpath = path.split('/')
    filename = splitpath[len(splitpath) - 1]
    parentPath = "/"
    for i in range(1, len(splitpath) - 1):
        parentPath += splitpath[i] + "/"
    parentPath = parentPath[:-1]
    to_update = mongo.db.code.find_one({'path':path})
    new_path = '/' + parentPath + data['newName']
    mongo.db.code.update({'path': path},
                         {'name': data['newName'],
                          'isDir': to_update['isDir'],
                          'contents': to_update['contents'],
                          'path': new_path})
    return "success"


@app.route('/load-rid/<rid>', methods=['GET'])
@cross_origin()
def load_rid(rid):
    print rid
    docs = mongo.db.code.find_one({'_id': bson.ObjectId(oid=str(rid))})
    if len(docs) <= 0:
        return "not found"
    elif docs['isDir']:
        return json.dumps({'isDir': True, 'contents': None, 'name': docs['name']})
        # return target[0]['contents']
    else:
        return json.dumps({'isDir': False, 'contents': docs['contents'], 'name': docs['name']})


@app.route('/move', defaults={'path': ''})
@app.route('/move/', defaults={'path': ''})
@app.route('/move/<path:destinationPath>', methods=['POST'])
def move_path(destinationPath):
    data = json.loads(request.data)
    destinationPath = "/" + destinationPath
    source = mongo.db.code.find_one({'path': data['currentpath']})
    target = mongo.db.code.find_one({'path': destinationPath})

    # Check for bad destinations
    if target == None:
        return "destination is not in the database"
    if target['isDir'] == False:
        return "destination is not a directory"

    print "destinationPath : " + destinationPath
    print target
    # delete from current parent
    mongo.db.code.update({'_id': source['parent']}, {"$pull": {'children': source['_id']}})

    # add to new parent
    mongo.db.code.update({'path': destinationPath}, {"$addToSet": {'children': source['_id']}})

    # update its parent and path
    mongo.db.code.update({'_id': source["_id"]},
                         {"$set": {'parent': target['_id'], 'path': destinationPath + "/" + source['name']}})
    return "success"


@app.route('/move-rid/<destinationID>', methods=['POST'])
def move_rid(destinationID):
    data = json.loads(request.data)
    sourceID = data['rid']
    source = mongo.db.code.find_one({'_id': bson.ObjectId(oid=str(sourceID))})
    target = mongo.db.code.find_one({'_id': bson.ObjectId(oid=str(destinationID))})

    # Check for bad destinations
    if target == None:
        return "destination is not in the database"
    if target['isDir'] == False:
        return "destination is not a directory"

    # delete from current parent
    mongo.db.code.update({'_id': source['parent']}, {"$pull": {'children': source['_id']}})

    # add to new parent
    mongo.db.code.update({'_id': target['_id']}, {"$addToSet": {'children': source['_id']}})

    # update its parent and path
    mongo.db.code.update({'_id': source["_id"]},
                         {"$set": {'parent': target['_id'], 'path': target['path'] + "/" + source['name']}})
    return "success"


@app.route('/delete-path', defaults={'path': ''})
@app.route('/delete-path/', defaults={'path': ''})
@app.route('/delete-path/<path:path>', methods=['DELETE'])
def delete_path(path):
    path = "/" + path
    if path == "/":
        return "No file given to be deleted"
    target = mongo.db.code.find_one({'path': path})
    # Remove target from parent's list of children
    rid = target['_id']
    path_tokens = path.split('/')
    parentPath = '/'.join(path_tokens[:-1])
    if '/' not in parentPath:
        parentPath = '/' + parentPath

    print parentPath

    mongo.db.code.update({'path':parentPath}, {"$pull": {'children': bson.ObjectId(oid=str(rid))}})

    if target['isDir'] == True:
        regpath = target['path'] + '/'
        mongo.db.code.remove({"path": {"$regex": regpath}})
    return json.dumps(mongo.db.code.remove({'path': path}))


@app.route('/delete-rid/<rid>', methods=['DELETE'])
def delete_rid(rid):
    target = mongo.db.code.find_one({'_id': bson.ObjectId(oid=str(rid))})
    if target['path'] == '/':
        return "Cannot delete root"
    # Remove target from parent's list of children
    parentID = target['parent']
    parentObj = mongo.db.code.find_one({'_id': bson.ObjectId(oid=str(parentID))})
    mongo.db.code.update({'path': parentObj['path']}, {"$pull": {'children': target['_id']}})
    if target['isDir'] == True:
        regpath = target['path'] + '/'
        mongo.db.code.remove({"path": {"$regex": regpath}})
    return json.dumps(mongo.db.code.remove({'_id': target['_id']}))


@app.before_first_request
def check_add_root():
    root = mongo.db.code.find_one({"path": "/"})
    if root == None:
        mongo.db.code.insert(
            {'name': "root", 'children': [], 'contents': None, 'isDir': True, 'parent': None, 'path': "/"})
    getRoot()
    return 1


if __name__ == '__main__':
    app.run(debug=True, port=4000, threaded=True)
