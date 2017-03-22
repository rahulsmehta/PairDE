#### UI
* React+Redux+TypeScript 2 ~~Decide between React+{Redux,MobX} or Angular2 for FE stack (leaning React right now)~~
* Exists (https://github.com/JedWatson/react-codemirror) ~~CodeMirror react component -- make it (i.e. under rahulsmehta) and then import if non-existent~~
    * No code completion in DrJava ~~CodeMirror code completion? Does this exist? How hard is it to make it a thing~~
* ~~Actually play around with DrJava to see what other features we need to implement on the front end~~
    * Shell? How to expose this...
    * We likely want to figure out how a REPL situation would work
* Use blueprint.js as component library for general UI stuff
* PhosphorJS as a "tabbed editor" component?

#### Backend Services
* Flask as the web framework
* Code storage DB (Firebase right now) 
    * "Snapshot"/checkpoint serialization of base64'd code -> SQL?
    * Store plain text or some encoding of it? Compress-then-base64?
    * Can we store diffs in firebase and then "replay" to construct a file?

#### General
* Set up semver
* Set up all boilerplate + add instructions for SETUP.md



#### Timeline (from README)
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
