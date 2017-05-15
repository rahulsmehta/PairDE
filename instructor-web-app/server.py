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
import requests

UPLOAD_FOLDER = '/uploads'
ALLOWED_EXTENSIONS = set(['java', 'csv'])

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
CORS(app)
mongo = PyMongo(app)


def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/home')
@app.route("/", methods=['GET', 'POST'])
def landing():
    if request.method == 'POST':
        d = request.form
        requestList = d.copy()
        fileToDelete = requestList['assignmentName']
        roast = fileToDelete[:len(fileToDelete)-1]
        assignment = mongo.db.assignments.find_one({'name': roast})
        if assignment is None:
            return "Assignment not found"
        partners = assignment['partners']
        for partnership in partners:
            url = "http://localhost:4000/delete-path/shared/" + partnership + "_" + roast
            print url
            assignment_dir = requests.delete(url)   
        mongo.db.assignments.remove({"name": roast})   

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
        
        #Handle Assignment Name
        name = request.form["name"]
        if name is None:
            return "Invalid Assignment Name"
        nameReg = "^[A-Za-z0-9_]*$"
        nameMatch = re.match(nameReg, name)
        if nameMatch is None:
            return "Invalid Assignment Name"
        
        #Handle Due Date
        duedate = request.form["due"]

        #Handle FileList
        d = request.form
        requestList = d.copy()
        numFiles = len(requestList) - 2
        files = []
        for i in range(1, numFiles + 1):
            newFile = requestList['file' + str(i)]
            files.append(requestList['file' + str(i)])
        for filename in files:
            fileReg = '^[A-Z][A-Za-z0-9]*\.java$'
            nameMatch = re.match(fileReg, filename)
            if nameMatch is None:
                return "Invalid File Name"

        mongo.db.assignments.insert({'name': name, 'files': files, 
            'due': duedate, 'partners': partner_list})

        data = json.dumps({'isDir': True, 'contents': None })
        filedata = json.dumps({'isDir': False, 'contents': ""})
        #for each partnership, create shared directory for assignment and for each file
        for partnership in partner_list:
            url = "http://localhost:4000/create-path/shared/" + partnership + "_" + name
            print url
            assignment_dir = requests.post(url, data = json.dumps({'isDir': True, 'contents': None}))   
            for filename in files:
                print filename
                file_dir = requests.post(url + "/" + filename, data = json.dumps({'isDir': False, 'contents': ""}))

    return render_template('newAssignment.html')


if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True, port=7000, threaded=True)
