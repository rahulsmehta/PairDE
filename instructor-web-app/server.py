import json
import bson
import re
import csv
import io
import os
from flask import Flask, request, render_template, url_for
from werkzeug import secure_filename
# from flask_uuid import FlaskUUID
from flask_pymongo import PyMongo
from uuid import uuid4
from bson.objectid import ObjectId
from flask_cors import CORS, cross_origin

UPLOAD_FOLDER = '/uploads'
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

@app.route('/assignment/newAssignment')
@app.route("/newAssignment", methods=['GET', 'POST'])
def create():
    if request.method == 'POST':

        #Handle Partner CSV
        if 'partners' not in request.files:
            return('No Partner File')
        file = request.files['partners']
        stream = io.StringIO(file.stream.read().decode("UTF8"), newline=None)
        csv_input = csv.reader(stream)
        partner_list = []
        for row in csv_input:
            if len(row) != 2:
                return "Invalid Partner CSV"
            partnerReg = "^[a-z0-9]*$"
            for netID in row:
                partnerMatch = re.match(partnerReg, netID)
                if partnerMatch is None:
                    return "Invalid NetID in Partner List"
            newPair = row[0] + "_" + row[1]
            partner_list.append(newPair)
        
        #Handle Filename
        name = request.form["name"]
        if name is None:
            return "Invalid FileName"
        nameReg = "^[A-Za-z0-9_]*$"
        nameMatch = re.match(nameReg, name)
        if nameMatch is None:
            return "Invalid FileName"
        
        #Handle Due Date
        duedate = request.form["due"]

        #Handle FileList
        mongo.db.assignments.insert({'name': name, 'files': ["Point2D.java", "HelloWorld.java"], 
            'due': duedate, 'partners': partner_list})
    return render_template('newAssignment.html')


if __name__ == '__main__':
    app.run(debug=True)
