import json
from flask import Flask, request, abort
from flask_uuid import FlaskUUID
from flask_pymongo import PyMongo
from uuid import uuid4

app = Flask(__name__)
flask_uuid = FlaskUUID()
flask_uuid.init_app(app)
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
#	def __init__()

def getRoot():
    root = list(mongo.db.code.find({'path': "/"}))
    print root[0]["_id"]
    return root[0]["_id"]


def new_rid():
    return str(uuid4())

# Given a path to file, return the path to parent of file
def getParentPath(path):
	array = path.split('/')
    newParentPath = ""
    for i in range(1, len(array)):
        newParentPath += "/" + array[i]
    return newParentPath

def getFilename(path):
	array = path.split('/')
	return array[len(array) - 1]
	
# Takes path to resource and returns RID from db
def getRID(pathtoresource):
    return pathtoresource


@app.route('/ping', methods=['GET'])
def pong():
    return "pong"


@app.route('/find/<id>', methods=['GET'])
def find(id):
    target = list(mongo.db.code.find({'_id': id}))
    if len(target) == 0:
        return "successs"
    else:
        return "failure"


@app.route('/root', methods=['GET'])
def root():
    root = list(mongo.db.code.find({'path': "/"}))
    return list[0]["_id"]


# Takes a JSON Object with parent path/rid, file contents, and isDir boolean
@app.route('/create/<path:path>', methods=['POST'])
def create(pathtoresource):
    data = json.loads(request.data)
    path = pathtoresource.split('/')
    filename = path[len(path) - 1]
    # STILL NEED TO DO:
    # Check that parent path exists
    # figure out what to do with root (ignore, for now)
    # verify that file with same name and parent does not exist in db (409 error)
    path = '/' + path
    parentPath = ""
    if data['parent'] == "":
        parent = getRoot()
    else:
        parent = data['parent']
        target = list(mongo.db.code.find({'_id': parent}))
        parentPath += target[0]['path']
        if target[0]['isDir'] == False:
            return "cannot add child to file"
        else:
            mongo.db.code.update({'parentPath': parent}, {"$addToSet": {'children': pathtoresource}})
    mongo.db.code.insert(
        {'name': filename, 'children': [], 'contents': data['contents'], 'isDir': data['isDir'], 'parent': parentPath,
         'path': "/" + pathtoresource})
    return filename


@app.route('/load-path', defaults={'path': ''})
@app.route('/load-path/', defaults={'path': ''})
@app.route('/load-path/<path:path>', methods=['GET'])
def load_path(path):
    path = '/' + path
    print path
    target = list(mongo.db.code.find({'path': path}))
    if len(target) <= 0:
        return "not found"
    else:
        return target[0]['contents']


@app.route('/load-rid/<string:id>')
def load_rid(id):
    target = list(mongo.db.code.find({'_id': id}))
    if len(target) <= 0:
        return "not found"
    else:
        return target[0]['contents']


@app.route('/move/<currentpath>/<newpath>', methods=['POST'])
def move(currentpath, newpath):
    target = list(mongo.db.code.find({'path': currentpath}))

    # delete from current parent
    parent = target[0]['parent']
    mongo.db.code.update({'_id': parent}, {"$pull": {'children': target[0]['_id']}})

    # add to new parent
    newParentPath = getParentPath(newpath)
    newParent = list(mongo.db.code.find({'path': newParentPath}))
    mongo.db.code.update({'path': newParentPath}, {"$addToSet": {'children': newpath}})

    # update its parent and path
    mongo.db.code.update({'_id': target[0]["_id"]}, {"$set": {'parent': newParentPath}, 'path': newpath})
    return "success"


@app.route('/delete/<pathtoresource>', methods=['DELETE'])
def delete(pathtoresource):
    target = list(mongo.db.code.find({'path': pathtoresource}))

    # Remove target from parent's list of children
    parent = target[0]['parent']
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


if __name__ == '__main__':
    app.run(debug=True)
