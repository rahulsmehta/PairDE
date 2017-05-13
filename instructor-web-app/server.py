import json
import bson
import re
from flask import Flask, request, render_template
# from flask_uuid import FlaskUUID
from flask_pymongo import PyMongo
from uuid import uuid4
from bson.objectid import ObjectId
from flask_cors import CORS, cross_origin

UPLOAD_FOLDER = '/path/to/the/uploads'
ALLOWED_EXTENSIONS = set(['java', 'csv'])

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
CORS(app)
mongo = PyMongo(app)


def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route("/")
def landing():
    mongoList = list(mongo.db.assignments.find())
    assignment_list = []
    for assignment in mongoList:
        assignment_list.append(assignment['name'])
    assignment_list = map(lambda x: {'name' : x,'href': '/assignment/{}'.format(x)}, assignment_list)
    return render_template('landing.html', instructor="rahulm!", assignment_list=assignment_list)

@app.route("/assignment/<name>")
def assignmentPage(name):
    assignment = mongo.db.assignments.find_one({'name': name})
    if assignment is None:
        return "Assignment not found"
    files = assignment['files']
    due = assignment['due']
    partners = assignment['partners']
    return render_template('assignmentPage.html', name = name, 
        files = files, due=due, partners=partners)

@app.route("/newAssignment")
def newAssignment():
    return render_template('newAssignment.html')

@app.route("/newAssignment", methods=['POST'])
def create():
    name = request.form["name"]
    #partners = request.form["partners"]
    duedate = request.form["due"]
    nameReg = "^[A-Za-z0-9_]*$"
    nameMatch = re.match(nameReg, name)
    if nameMatch is None:
        return "Invalid FileName"
    partner_list = ["ethanrc_rahulmd", "mhw3_davidsp"]
    mongo.db.assignments.insert({'name': name, 'files': ["Point2D.java", "HelloWorld.java"], 
        'due': duedate, 'partners': partner_list})
    return render_template('newAssignment.html')

if __name__ == '__main__':
    app.run(debug=True)
