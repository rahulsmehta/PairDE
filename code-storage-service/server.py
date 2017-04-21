from flask import Flask, request, redirect, url_for
from flask_pymongo import PyMongo

app = Flask(__name__)
mongo = PyMongo(app)

"""
TODO: Implement storage service with headless git repo
"""


# Set endpoint prefix to /v1 for initial API
# app.config["APPLICATION_ROOT"] = "/v1"

@app.route('/ping', methods=['GET'])
def pong():
    return "pong"

@app.route('/root', methods=['GET'])
def root():
    return "pong"

@app.route('/create/<parent>/<filename>', methods=['GET'])
def create(parent, filename):
	data = json.loads(request.data)
	if data['parent'] is null:
		parent = '942892pd0'
	else:
		parent = data['parent']
    mongo.db.code.insert({'name':filename, 'children':[], 'contents': data['contents'], 'isDir': data['isDir'], 'parent': parent})
    return len(mongo.db.code.find({'name':pathtoresource}))

@app.route('/load/<pathtoresource>', methods=['GET'])
def create(pathtoresource):
    x = mongo.db.code.find({'name':pathtoresource})
    return x['contents']


@app.route('create/<pathtoresource><contents>')
if __name__ == '__main__':
    app.run(debug=True)
