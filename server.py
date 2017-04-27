from flask import Flask, render_template
from calculate_interval import IntervalMontior
import math

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
# socketio = SocketIO(app)
data = {'rpm': 0, 'history':{}}

@app.route('/')
def hello_world():
    return render_template('index.html', rpm=monitor.get_rpm())
    
@app.route('/rpm/<int:since>')
def rpm_since(since):
    
    rpm_per_sec = []
    last_time = 0
    offset_start = 0
    step = 0
    last_sec = 0;
    for time in monitor.get_history():
        if (not since) or time > since
            if last_time > 0:
                elapsed = time - last_time # Time since the last second, 
                rpm = 1 / elapsed * 60
                curr_sec = math.floor(time)
                if (curr_sec - last_sec) > 1:
                while last_sec < curr_sec:
                    rpm_per_sec.append(rpm)
                    last_sec += 1
                rpm_per_sec.append(rpm)
                
                last_sec = curr_sec
                last_time = time
            else:
                last_sec = math.floor(time)
                offset_start = time
                last_time = time
            
    
    return 0


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
    # socketio.run(app)