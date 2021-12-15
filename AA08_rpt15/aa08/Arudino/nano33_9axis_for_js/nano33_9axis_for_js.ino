#include <Arduino_LSM9DS1.h>

void setup() {
  Serial.begin(9600);
  
  if (!IMU.begin()) {
    Serial.println("LSM6DS3센서 오류!");
    while (1);
  }
}

float accel_x, accel_y, accel_z;
float gyro_x, gyro_y, gyro_z;
float mag_x, mag_y, mag_z;

void loop() {
  if(IMU.accelerationAvailable()) { IMU.readAcceleration(accel_x, accel_y, accel_z); }
  if(IMU.gyroscopeAvailable()) { IMU.readGyroscope(gyro_x, gyro_y, gyro_z); }
  if(IMU.magneticFieldAvailable()) { IMU.readMagneticField(mag_x, mag_y, mag_z); }

  char buffer[100];
                , accel_x, accel_y, accel_z, gyro_x, gyro_y, gyro_z, mag_x, mag_y, mag_z);
  sprintf(buffer, "AA08, %.2f, %.2f, %.2f, %.2f, %.2f, %.2f, %.2f, %.2f, %.2f"
  Serial.println(buffer);
  
  delay(1000);
}
