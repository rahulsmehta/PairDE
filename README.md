## PairDE: A web-based, pair-programming oriented IDE

#### Team Information

*Project Manager* - Rahul Mehta ([rahulmehta@princeton.edu](mailto:rahulmehta@princeton.edu)

*Other Members*
* Ethan Cohen ([ethanrc@princeton.edu](mailto:ethanrc@princeton.edu))
* Sam Perkins ([sperk@princeton.edu](mailto:sperk@princeton.edu))
* Michael Weissman ([mhw3@princeton.edu](mailto:mhw3@princeton.edu))


### Overview

##### Elevator Pitch 
Princeton’s introductory CS sequence is one of the best in the nation, and serves as a model for many other universities’ programs. Within these courses, many of the assignments are designed as partner assignments. While providing a great deal of pedagogical value, these courses (in particular COS 126) also have a strict collaboration policy which, among other stipulations, requires students to be physically together when working on an assignment. Although some iterations of the class have relaxed this, pair-programming with the current IDE, Dr. Java, is much more difficult; students need to manually sync source code on both machines (and, due to the intro nature of the course, git is undoubtedly out of the question) and cannot track changes in real time. To solve this, we propose PairDE, a web-based IDE that we hope can serve as a replacement for Dr. Java in Princeton’s intro CS classes. The IDE will feature pair-programming as a first-class concept, and will provide integration with the CS grading framework and other course infrastructure to enable quick iteration and collaboration with course staff.

More broadly, PairDE seeks to solve two problems; that of easily collaborating with a partner, and that of mitigating potentially-avoidable violations of the collaboration policy. The strict nature of the policy unfortunately leads to a number of such incidents annually, and we believe the use of this platform will also help minimize this risk. In subsequent sections, we will outline target users and a notional use-case of our platform within the CS department.


### Requirements & Functionality
##### Target Users
PairDE is a platform that will serve as the touchpoint for all coursework; accordingly, it targets two distinct user groups; students and instructors.

*Students*: The primary users of the platform will be students within an introductory CS class at Princeton. Thus, the platform seeks to negotiate several key requirements regarding usability from a novice programmer’s point of view.
* **Simplicity** - Dr. Java’s UI consists of several basic components; a code-editor, a file-system viewer (of the current working directory), a Java REPL (read-evaluate-print-loop) for scratchpad work, and a terminal for compilation/running. There are also buttons for triggering particular terminal commands (i.e. compile, Javadoc, etc.).
* **Performance** - while more modern IDEs have been optimized for performance (such as Eclipse/IntelliJ), ones that are targeted towards the novice population are typically far older. As such, performance can be poor in certain scenarios. By moving to a web-based system and using high-availability infrastructure (AWS/other provider), we guarantee application responsiveness/performance for the end-user while delegating code execution to a remote service.
* **Collaboration** - collaboration between students has great pedagogical value in introductory CS classes. However, pair-programming and other collaboration mechanisms are often quite difficult for intro CS students; industry-standard collaboration mechanisms such as git or other distributed version-control systems are far beyond the grasp of a first-time programmer. Thus, PairDE will also enable versioning as well as the ability to track the contributions of each partner.

*Instructors*: Another key group that PairDE targets are the course instructors. We also hope that PairDE can help centralize many of the tasks that are currently broken into different systems by the CS department.
* **Grading/dropbox scripts** - PairDE will include its own grading feature, and will target implementing a spec such that current dropbox grading scripts/other evaluation tools can be easily ported there. The current iteration of the mechanism would take a tar archive that when unzipped would contain a “run_tests.sh” file that encodes the test mechanism.
* **Student progress tracking** - PairDE provides information about students at a very granular level (i.e. lines contributed, etc.); thus, instructors will be able to monitor student progress as well as ensure that assignments are evenly completed between partners.
* **Ease of interaction with students** - Currently when students need to share code with an instructor, either emailing a zip archive of the source code or uploading it to the dropbox seem to be the only two ways to obtain feedback from an instructor/TA. PairDE will support a mechanism to send entire source code files or code snippets directly to instructors, reducing the latency for queries to get answered.
* **Functionality** - PairDE will implement features to meet the above requirements. Below we describe first a minimal feature set (our MVP) for our prototype, and then subsequent features that can independently be added.

*MVP - Student Workflows*
* Students are able to sign up for an account on the website and can log in to the editor
* Students can form a “team” to begin an assignment
* Base editor functionality
	* Code editor with the ability to save & compile (in Java)
    * Editor only allows one user to enter code at a time
    * Editor live-syncs between collaborators
* Assignment “submission” working (for student iteration, just checks that it compiles/runs without throwing an exception - the instructor feature set will then implement grading infrastructure)
* Minimal instructor interactions - students can “share” code snippets or entire files with the course staff in order to get help with debugging, performance issues, etc. At first this will simply send an email to the course instructors, but a second iteration of the instructor UI will actually provide an interface to answer these queries


*The Instructor Workflow*
* Ability to create “assignments” with associated grading scripts, template files, and other specifications
* Ability to view students and track progress (view code to track progress)
* Interface for answering student questions on webapp

### Design

Our application is a three-tier system; we will describe the database, the user interface, and the business logic below.

*Database*: Our application will require two database systems; a traditional relational database for storing user account information as well as static information such as discussion between instructors/students on shared code, etc., and a real-time database to deal with syncing the code editors. We will use PostgreSQL or MySQL for the former, and Google Firebase for the latter.

*User Interface*: Our application will use React and Redux as the backbone of our front-end infrastructure. We will leverage existing UI toolkits such as Bootstrap for the basic structure of our views, and will use Code Mirror (an existing code pad component) as our code editor. Note that Code Mirror does not handle the live-sync problem as described before; this we will implement on our own. We plan on using several libraries of open-source React components to speed up our initial UI prototyping.

*Business Logic*: The significant components of the application are within the middleware; this must handle live-syncing code editors between partners, versioning submission files, compilation, and execution. Thus, our middleware “web server” will be broken down into several services
* **Compilation/execution service**: service that handles compilation and execution of Java files. The compilation component takes a sequence of base64-encoded source code files (or a tar archive if specified) along with a compilation command that the service will execute. The compilation service reports any errors during compilation, or that it was successful. The execution service will execute the artifacts produced during the compilation stage, and will respond with any console output.

* **Code live-sync service**: the “sync” service will provide a lightweight wrapper on top of the Firebase API to coordinate sessions between partners and ensure correct access control permissions so no code is exposed to other students.

* **Grading service**: service that listens for assignment submissions and runs an instructor-provided grading script, recording any errors or deductions the script produces

*Risks & Concerns*: This is a large system with many distinct components. However, we believe that its current structure will enable us to initially work towards a tightly-scoped MVP for just student functionality, and then incrementally build that out to include more functionality for the instructors. The biggest risk we see is within getting the code live-syncing working; Firebase is an established technology, but none of the team members are intimately familiar with it, so this might pose a significant engineering challenge. Another risk is that only one member of the team has any prior front-end experience, so there may be a number of blockers originating from there as well.


### Project Timeline

* March 19 -- Design Document Due
* Spring Break (March 19-24): Initial UI prototype working against mocked back-end services
* Week of March 27 - Meet with Jeremie Lumbroso to align expectations/get signal about what feature set is most valuable to the COS 126 instructors.
* March 31 - Complete UI prototype along with initial implementation of compilation service
* April 7 - Completed compilation & execution service, with initial prototype of live-syncing service
* April 14 (prototype due) - Finished MVP for student functionality, including full live-syncing as well as a completed UI prototype and a functional compilation/execution service
* April 21 - Begin work on instructor MVP while ironing out kinks with student component
	* Basic implementation of UI for grading service (i.e. allow instructors to upload grading scripts/other specifications)
	* Basic implementation of back-end grading service
	* Harden existing compilation/execution service and fix any bugs uncovered during prototype test
* April 28 (alpha test) - Harden student component (should be final at this point) and have complete implementation of the grading service ready 
* May 5 (beta test) - hardened implementation of full student features and grading component. Also have initial implementation of instructor-student code sharing available in the beta test
* May 14 - project due by Midnight 



















