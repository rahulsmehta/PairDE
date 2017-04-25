import json
from flask import Flask, request, redirect, url_for
from flask_pymongo import PyMongo
from uuid import uuid4
app = Flask(__name__)
mongo = PyMongo(app)

"""
TODO: Implement storage service with headless git repo
"""

# Set endpoint prefix to /v1 for initial API
# app.config["APPLICATION_ROOT"] = "/v1"

#Maintenance to do:
# 1) define a resource class
# 2) Replace rids with mongo ObjectID
# 3) Create a new endpoints so that each call handles RID and filename

#class Resource:
#	def __init__()

def getRoot():
	root = list(mongo.db.code.find({'path': "/"}))
	return list[0]["_id"]

def new_rid():
	return str(uuid4())

#Takes path to resource and returns RID from db
def getRID(pathtoresource):
	return pathtoresource

@app.route('/ping', methods=['GET'])
def pong():
	return "pong"

@app.route('/find/<rid>', methods=['GET'])
def find(rid):
	myList = list(mongo.db.code.find({'_id':rid}))
	if len(myList) == 0:
		return "successs"
	else:
		return "failure"

@app.route('/root', methods=['GET'])
def root():
	root = list(mongo.db.code.find({'path': "/"}))
	return list[0]["_id"]

#Takes a JSON Object with parent path/rid, file contents, and isDir boolean 
@app.route('/create/<filename>', methods=['POST'])
def create(filename):
	data = json.loads(request.data)
	rid = new_rid()
	#STILL NEED TO DO:
	#figure out what to do with root (ignore, for now)
	#verify that file with same name and parent does not exist in db (409 error)
	parentPath = ""
	if data['parent'] == "":
		parent = getRoot()
	else:
		parent = data['parent']
		myList = list(mongo.db.code.find({'rid':parent}))
		parentPath += myList[0]['path']		
		if myList[0]['isDir'] == False:
			return "cannot add child to file"
		else:
			mongo.db.code.update({'rid':parent}, { "$addToSet": {'children':rid} })
	path = parentPath + "/" + filename
	mongo.db.code.insert({'name':filename, 'rid':rid, 'children':[], 'contents': data['contents'], 'isDir': data['isDir'], 'parent': parent, 'path':path})
	return rid


@app.route('/load/<pathtoresource>', methods=['GET'])
def load(pathtoresource):
	myList = list(mongo.db.code.find({'path':pathtoresource}))
	return myList[0]['contents']


@app.route('/move/<currentpath>/<newpath>', methods=['POST'])
def move(currentpath, newpath):
	target = list(mongo.db.code.find({'path':currentpath}))

	#delete from current parent
	parent = target[0]['parent']
	mongo.db.code.update({'_id':parent}, { "$pull": {'children':target[0]['_id']} })

	# add to new parent 
	newParent = list(mongo.db.code.find({'path':newpath}))
	path = newParent[0]['path']
	mongo.db.code.update({'path':newpath}, { "$addToSet": {'children':rid} })

	#update its parent
	mongo.db.code.update({'rid':rid}, { "$set": {'parent':newrid}, 'path': path + "/" + myList[0]['name'] })

	return "success"


@app.route('/delete/<pathtoresource>', methods=['DELETE'])
def delete(pathtoresource):
	rid = getRID(pathtoresource)
	myList = list(mongo.db.code.find({'rid':rid}))

	#Remove target from parent's list of children
	parent = myList[0]['parent']
	mongo.db.code.update({'rid':parent}, { "$pull": {'children':rid} })
	if myList[0]['isDir'] == True:
		path = myList[0]['path'] + '/'
		mongo.db.code.remove({"path": {"$regex": path}})
	print path
	return json.dumps(mongo.db.code.remove({'rid': rid}))

@app.before_first_request
def addRoot():
	root = mongo.db.code.find({'_id': getRoot()})
	if root.count() == 0:
		mongo.db.code.insert({'name':"root", 'children':[], 'contents': None, 'isDir': True, 'parent': None, 'path':"/"})

if __name__ == '__main__':
	app.run(debug=True)

