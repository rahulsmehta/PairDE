import json
import bson
from flask import Flask, request
#from flask_uuid import FlaskUUID
from flask_pymongo import PyMongo
from uuid import uuid4
from bson.objectid import ObjectId

app = Flask(__name__)
#flask_uuid = FlaskUUID()
#flask_uuid.init_app(app)
mongo = PyMongo(app)

"""
TODO: Implement storage service with headless git repo
"""


# Set endpoint prefix to /v1 for initial API
# app.config["APPLICATION_ROOT"] = "/v1"

# Maintenance to do:
# 1) define a resource class
# 2) Replace rids with mongo ObjectID
# 3) Create a new endpoints so that each call handles RID and filename

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
    
# # Takes a JSON Object with parent path/rid, file contents, and isDir boolean
# @app.route('/create/<pathtoresource>', methods=['POST'])
# def create(pathtoresource):
#     data = json.loads(request.data)
#     path = pathtoresource.split('/')
#     filename = path[len(path) - 1]
#     # STILL NEED TO DO:
#     # figure out what to do with root (ignore, for now)
#     # verify that file with same name and parent does not exist in db (409 error)
#     parentPath = ""
#     if data['parent'] == "":
#         parent = getRoot()
#     else:
#         parent = data['parent']
#         target = mongo.db.code.find_one({'_id': bson.ObjectId(oid = str(parent))})
#         parentPath += target['path']
#         if target['isDir'] == False:
#             return "cannot add child to file"
#         else:
#             mongo.db.code.insert(
#                 {'name': filename, 'children': [], 'contents': data['contents'], 'isDir': data['isDir'], 'parent': parent,
#                  'path': "/" + pathtoresource})
#             mongo.db.code.update({'_id': bson.ObjectId(oid = str(parent)}, {"$addToSet": {'children': pathtoresource}})
#     return filename


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


@app.route('/load-rid/<rid>', methods=['GET'])
def load_rid(rid):
    print rid
    docs = mongo.db.code.find_one({'_id': bson.ObjectId(oid = str(rid))})
    if len(docs) <= 0:
        return "not found"
    else:
        #return target[0]['contents']
        return docs['contents']


@app.route('/move/<currentpath>/<newpath>', methods=['POST'])
def move(currentpath, newpath):
    target = list(mongo.db.code.find({'path': currentpath}))

    # delete from current parent
    parent = target[0]['parent']
    mongo.db.code.update({'_id': parent}, {"$pull": {'children': target[0]['_id']}})

    # add to new parent
    tree = newpath.split('/')
    newParentPath = ""
    for i in range(1, len(tree) - 1):
        newParentPath += "/" + resource
    newParent = list(mongo.db.code.find({'path': newParentPath}))
    mongo.db.code.update({'path': newParentPath}, {"$addToSet": {'children': newpath}})

    # update its parent and path
    mongo.db.code.update({'_id': target[0]["_id"]}, {"$set": {'parent': newParentPath}, 'path': newpath})
    return "success"

@app.route('/delete-path', defaults={'path': ''})
@app.route('/delete-path/', defaults={'path': ''})
@app.route('/delete-path/<path:path>', methods=['DELETE'])
def delete_path(path):
    path = "/" + path
    target = mongo.db.code.find_one({'path': path})
    print target

    # Remove target from parent's list of children
    rid = target['_id']
    parentId = target['parent']

    mongo.db.code.update({'_id': bson.ObjectId(oid = str(parentId))}, {"$pull": {'children': rid}})

    if target['isDir'] == True:
        regpath = target['path'] + '/'
        mongo.db.code.remove({"path": {"$regex": regpath}})
    return json.dumps(mongo.db.code.remove({'path': path}))



@app.route('/delete-rid/<rid>', methods=['DELETE'])
def delete_rid(rid):
    target = mongo.db.code.find_one({'_id': bson.ObjectId(oid = str(rid))})

    # Remove target from parent's list of children
    parent = target['parent']
    mongo.db.code.update({'path': parent}, {"$pull": {'children': pathtoresource}})
    if target[0]['isDir'] == True:
        path = target[0]['path'] + '/'
        mongo.db.code.remove({"path": {"$regex": path}})
    return json.dumps(mongo.db.code.remove({'path': pathtoresource}))


@app.before_first_request
def check_add_root():
    root = list(mongo.db.code.find({"path": "/"}))
    if len(root) == 0:
        mongo.db.code.insert(
            {'name': "root", 'children': [], 'contents': None, 'isDir': True, 'parent': None, 'path': "/"})
    getRoot()
    return 1


if __name__ == '__main__':
    app.run(debug=True)
