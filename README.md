## Local development setup with powershell

0. Locate Powershell (better version of ms dos) on your computer, run as administrator
1. Install chocolatey (Windows package manager) paste into Powershell: `Set-ExecutionPolicy Bypass -Scope Process -Force; iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))`
2. Using chocolatey install yarn (Javascript package manager): `choco install yarn`
3. Install git (version control): `choco install git`
4. Set git credentials email: `git config --global user.email "you@you.com"`
5. Set git credentials name: `git config --global user.email "your name"`
6. Install vscode (text editor): https://go.microsoft.com/fwlink/?LinkID=534107
7. Switch to your home directory: `cd $home`
8. Clone our repo: `https://github.com/bensinjin/wordz.git`
9. Switch to repo directory: `cd wordz`
10. Install dependencies: `yarn`

NOTE: If at any point a command doesn't work close and re open powershell.

## Expo information

Expo allows us to run our mobile application without having to set up tools like Android studio and Xcode, the iOS equivalent.
We use it to get up and running with development quicker. Here are the basics:

0. Switch to the previously cloned repo: `cd wordz`
1. Type: `yarn start`, this starts a server that will serve our mobile application
2. Install the Expo app on your phone from the play store or the app store
3. Scan the QR code which shows up in your Powershell window, this will open the app in expo

## Python puzzle generator script (WIP not currently working on Windows)

Currently we're playing with a script to generate our levels. If you want to try it out:

0. Install python: `choco install python`
1. Clone the repo, preferably in your home directory: `git clone https://github.com/bensinjin/puzzle_gen.git`
2. Switch to directory: `cd puzzle_gen`
3. Create a virtual environment for python: `python venv -m .venv`
4. Loosen rules around running scripts (may only be on Windows 7): `Set-ExecutionPolicy RemoteSigned` 
5. Enable the environment: `.venv\Scripts\activate`
6. Install dependencies: `pip install -r requirements.txt`


## Development process

All work should be done in your own branch off of master once work is finished it should be reviewed
by the other developer and finally merged into master by them not you. To get started:

0. Open powershell, `cd $home`
1. Ensure you're on the master branch: `git branch`
2. Create a new branch: `git checkout -b Issue_Number_Issue_Description
3. Work on your work, when done: `git add -p .`, double check you're only adding what you should
4. Commit your work with a message: `git commit -m "Issue #123 Added scoring to the game"`
5. Push your work off to github: `git push origin Issue_Number_Issue_Description`
