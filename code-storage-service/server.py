"""
TODO: Implement storage service with headless git repo
"""
import json
from flask import Flask, request
from flask.ext.pymongo import PyMongo

app = Flask(__name__)
mongo = PyMongo(app)


@app.route('/create/<path_to_resource>', methods=['POST'])
def create(path_to_resource):
    data = json.loads(request.data)
    encoded_contents = data['encoded_contents']

    mongo.db.categories.insert({'_id': path_to_resource, 'children': None, 'body': encoded_contents })
    return None


@app.route('/createFolder/<path_to_folder>', methods=['POST'])
def create_folder():
    return None


@app.route('/moveFile/<path_to_dest>', methods=['POST'])
def move_file():
    return None


@app.route('/delete/<path_to_resource>', methods=['DELETE'])
def delete():
    return None


@app.route('/load/<path_to_resource>', methods=['GET'])
def load():
    return None
