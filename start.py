import os
import subprocess
import webbrowser
import time

# 1️⃣ Start the Node.js server
print("Starting server...")
server_process = subprocess.Popen(["node", "server.js"])

# 2️⃣ Wait a moment for the server to start
time.sleep(2)

# 3️⃣ Open the clicker HTML page in the default browser
# Make sure the HTML file is in the same folder
webbrowser.open("file://" + os.path.abspath("index.html"))

# 4️⃣ Keep Python running to keep the server alive
try:
    server_process.wait()
except KeyboardInterrupt:
    print("Stopping server...")
    server_process.terminate()
