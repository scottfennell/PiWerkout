"""
IntervalMonitor actually records that data input and stores it in some way
"""

import time
import math
import random
import threading
from stats import WorkoutStats
from gpiozero import Button

class IntervalMontior(object):
    """
    Interval Monitor
    """
    rpm = 0
    elapse = 0
    sensor = 17
    start_timer = time.time()
    running = True
    cond = None
    data = None
    buffer = []

    archive_timeout = 1800
    current_workout = {'rpm': 0, 'history':{}, 'rot_count': 0, 'rpm_data': []}
    workoutStats = WorkoutStats()
    ioPin = None


    def __init__(self, radius, debug=False):
        self.radius = radius
        self.init_interrupt()
        if debug:
            self.set_interval(self.test_trigger)

    def test_trigger(self):
        """
        Trigger io pin
        """
        if self.ioPin:
            self.calculate_elapse()

    def calculate_elapse(self):
        """
        Add another measurement
        """
        self.elapse = time.time() - self.start_timer      # elapse for every 1 complete rotation made!
           
        self.start_timer = time.time()            # let current time equals to start_timer
        self.buffer.append(self.start_timer)
        self.compile_rpm()

    def get_current_workout(self):
        """
        Get current workout data
        """
        return self.current_workout

    def get_rpm(self):
        """
        get the current rpm measurment
        """
        return self.rpm

    def get_buffer(self):
        """
        get the history
        """
        return self.buffer

    def clear_buffer(self):
        """
        start interrupt
        """
        self.buffer = []
        return self.buffer


    def init_interrupt(self):
        """
        start interrupt
        """
        self.ioPin = Button(self.sensor, bounce_time=0.2)
        self.ioPin.when_pressed = self.calculate_elapse

    def set_interval(self, func, sec=0):
        """ Set interval to check for ....stuff """
        if sec is 0:
            setsec = random.uniform(0.8, 1.2)
        def func_wrapper():
            self.set_interval(func, sec)
            func()
        tmr = threading.Timer(setsec, func_wrapper)
        tmr.start()
        return tmr

    def check_reset_current_workout(self):
        """
        Check for an elapsed time and clear data if it has been passed the elapsed
        """

        rpm_data = self.current_workout["rpm_data"]
        current_data_length = len(rpm_data)

        if current_data_length > 0:
            last_time = rpm_data[-1]['time']
            if (time.time() - last_time) > self.archive_timeout:
                print("Resetting current workout data", last_time, time.time(), self.archive_timeout)
                self.current_workout = {
                    'rpm': 0,
                    'rot_count': 0,
                    'rpm_data': [],
                    'start_time': time.time()
                }
        else:
            self.current_workout = {
                'rpm': 0,
                'rot_count': 0,
                'rpm_data': [],
                'start_time': time.time()
            }


    def compile_rpm(self):
        """ Gather rpm data and enrich with statistics """
        last_time = 0
        last_sec = 0
        last_rpm = 0

        self.check_reset_current_workout()
        buff = self.get_buffer()
        rpm_data = self.current_workout['rpm_data']

        #If the time gap between the last history is within a threshhold
        #Loop over the seconds (or maybe minutes)
        #Adding in data points of zero when we have no data

        current_data_length = len(rpm_data)
        if current_data_length > 0:
            last_time = rpm_data[-1]['time']

        for pedal_time in buff:
            if last_time > 0:
                rpm = 0
                elapsed = pedal_time - last_time # Time since the last second,
                if elapsed > 0:
                    rpm = 1 / elapsed * 60
                curr_sec = math.floor(pedal_time)
                # if (curr_sec - last_sec) > 1:
                #     while last_sec < curr_sec:
                #         rpm_data.append({"time": pedal_time - (curr_sec - last_sec), "rpm": rpm})
                #         last_sec += 1
                rpm_data.append({"time": pedal_time, "rpm": rpm})
                last_rpm = rpm
                last_sec = curr_sec
                last_time = pedal_time
            else:
                last_sec = math.floor(pedal_time)
                last_time = pedal_time
                rpm_data.append({"time": pedal_time, "rpm": 0})
            self.current_workout["rot_count"] += 1


        #self.current_workout["rpm_data"] = [a for a in rpm_data if a["time"] > since]

        self.current_workout["rpm_data"] = rpm_data
        self.current_workout["velocity"] = self.workoutStats.calculate_speed(last_rpm, 10)
        self.clear_buffer()

        return self.current_workout

