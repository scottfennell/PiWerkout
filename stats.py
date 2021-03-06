""" WorkoutStats does stuff """
import math

class WorkoutStats(object):
    """ Gather and store statistics about workouts """
    grade = [] # Meters per meter, 1 is really steep
    grade_steps = 1 #Meters
    default_grade = 0.1
    gravity = 9.8067 #m/s^2
    weight = 98 #kg
    resistance = 0.01 #Bumpiness of the road
    air_drag = 0.62 # Drag coef * area
    air_density = 1.226 #kg/m^3 1.225 sea level 15c
    average_velocity = 10 #m/s for calculating resistance
    watts_per_rpm = 1.75; 
    bicycle_drag = 0.05

    def __init__(self):
        self.grade = []
        
    def get_grade(self, distance):
        """ Get the grade from a lookup table, wrapping around if if it doesn't go that far """
        grade_length = len(self.grade)
        if grade_length > 0:
            return self.grade[math.floor(distance * self.grade_steps) % len(self.grade)]
        else:
            return self.default_grade

    def calculate_speed(self, rpm, distance):
        """Calculate speed attemts to convert the rpm into a meters per second value based on 
        the current grade, which would come from a lookup table
        """
        #https://www.gribble.org/cycling/power_v_speed.html
        G = self.get_grade(distance)
        #gravity force
        g_force = self.gravity * math.sin(math.atan(G / 100)) * self.weight
        #rolling force
        r_force = self.gravity * math.cos(math.atan(G / 100)) * self.weight * self.resistance
        f_drag = 0.5 * self.air_drag * self.air_density * (self.average_velocity ^ 2)
        total_resistance = (g_force + r_force + f_drag) * (1 - self.bicycle_drag)
        watts = (self.watts_per_rpm * rpm)
        velocity = watts / total_resistance
        return velocity
