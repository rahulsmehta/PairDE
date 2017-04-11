from flask import Flask, request
from flask_pymongo import PyMongo
import json
app = Flask(__name__)
mongo = PyMongo(app)
from pymongo import MongoClient

"""
TODO: Implement storage service with headless git repo
"""

# Set endpoint prefix to /v1 for initial API
# app.config["APPLICATION_ROOT"] = "/v1"

@app.route('/ping', methods = ['GET'])
def pong():
  return "pong"

@app.route('/create/<pathtoresource>', methods = ['GET'])
def create(pathtoresource):
  client = MongoClient()
  #newID = db.insert_one({'name':'sam'})
  db = client.local
  return type(db)


if __name__ == '__main__':
    app.run(debug=True)