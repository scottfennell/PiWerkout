import math

class WorkoutStats(): 
    
    grade = [] # Meters per meter, 1 is really steep
    grade_steps = 1 #Meters
    default_grade = 0.1
    gravity = 9.8067 #m/s^2
    weight = 98 #kg
    resistance = 0.005 #Bumpiness of the road
    air_drag = 0.52 # Drag coef * area
    air_density = 1.226 #kg/m^3 1.225 sea level 15c
    average_velocity = 10 #m/s for calculating resistance
    watts_per_rpm = 140 / 80;
    bicycle_drag = 0.03;

    
    def __init__(self):
        self.grade = []
        
    def get_grade(self, distance):
        if len(self.grade) > 0:
            return self.grade[math.floor(distance * grade_steps) % len(self.grade)]
        else:
            return self.default_grade
    
    def calculate_speed(self, rpm, distance):
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
        
        
        
        
        
        
        
        
        