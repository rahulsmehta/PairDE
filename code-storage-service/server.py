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
def getRoot():
	return "8013998e-160e-4b5c-aad6-7c8c203da879"

def new_rid():
   return str(uuid4())

#Takes path to resource and returns RID from db
def getRID(pathtoresource):
	return pathtoresource

@app.route('/ping', methods=['GET'])
def pong():
	return "pong"

@app.route('/root', methods=['GET'])
def root():
	return "8013998e-160e-4b5c-aad6-7c8c203da879"

@app.route('/create/<filename>', methods=['POST'])
def create(filename):
	data = json.loads(request.data)
	rid = new_rid()
	#verify that parent is a directory
	#verify that file with same name and parent does not exist in db
	if data['parent'] == "":
		parent = getRoot()
	else:
		parent = data['parent']
		mongo.db.code.update({'rid':parent}, { "$addToSet": {'children':rid} })
	mongo.db.code.insert({'name':filename, 'rid':rid, 'children':[], 'contents': data['contents'], 'isDir': data['isDir'], 'parent': parent})
	return "success"

@app.route('/load/<pathtoresource>', methods=['GET'])
def load(pathtoresource):
	rid = getRID(pathtoresource)
	myList = list(mongo.db.code.find({'rid':rid}))
	return myList[0]['contents']

@app.route('/delete/<pathtoresource>', methods=['DELETE'])
def delete(pathtoresource):
	rid = getRID(pathtoresource)
	myList = list(mongo.db.code.find({'rid':rid}))
	#Remove target from parent's list of children
	parent = myList[0]['parent']
	mongo.db.code.update({'rid':parent}, { "$pull": {'children':rid} })

	#If target has children, delete them
	children = myList[0]['children']
	for child in children:
		mongo.db.code.remove({'rid':child})
	mongo.db.code.remove({'rid':rid})

if __name__ == '__main__':
	app.run(debug=True)
