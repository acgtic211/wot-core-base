#include <WiFi.h>
#include <ESPmDNS.h>
#include <AsyncTCP.h>
#include <ESPAsyncWebServer.h>
#include <HTTPClient.h>
#include <Servo.h>

Servo myservo;  // create servo object to control a servo

// GPIO the servo is attached to
static const int servoPin = 13;

// Replace with your network credentials
const char* ssid     = "ACG";
const char* password = "1123581321acg";
const String domain = "acg.ual.es/projects/cosmart/wot-lab/things/acg:lab:servo2/";
IPAddress ip;

// Puerto del servidor web
AsyncWebServer server(80);


// Variable to store the HTTP request
String header;

// Decode HTTP GET value
String valueString = String(5);

// Current time
unsigned long currentTime = millis();
// Previous time
unsigned long previousTime = 0; 
// Define timeout time in milliseconds (example: 2000ms = 2s)
const long timeoutTime = 2000;

void setup() {
  Serial.begin(115200);
 
  connectWifi();
  initMDNS();
 
  // Arrancar el servidor
  server.on("/", HTTP_GET, handleRoot);
  server.on("/action/move", HTTP_GET, moveServo);
 
  server.begin();

  // Add service to MDNS-SD
  MDNS.addService("wot", "tcp", 80);



  // attaches the servo on the servoPin to the servo object
  myservo.attach(servoPin);  

}

void loop(){
 
}


/* API */

void handleRoot(AsyncWebServerRequest *request) 
{
  String input = "{\"@context\":\"https:\/\/www.w3.org\/2019\/wot\/td\/v1\",\"title\":\"ACG Lab Servo Flag\",\"id\":\"acg:lab:servo2\",\"description\": \"Servo with a flag attached\", \"base\":\"http:\/\/" +domain+ "\",\"securityDefinitions\":{\"nosec_sc\":{\"scheme\":\"nosec\"}},\"security\":\"nosec_sc\",\"properties\":{},\"actions\":{\"move\":{\"title\":\"move\",\"output\":{\"type\":\"string\"},\"forms\":[{\"op\":\"invokeaction\",\"href\":\"http:\/\/" +domain+ "action\/move\"}]}},\"events\":{}}";
  AsyncWebServerResponse *response = request->beginResponse(200, "application/td+json", input.c_str());
  response->addHeader("Access-Control-Allow-Origin", "*");
  request->send(response);
}

void moveServo(AsyncWebServerRequest *request) 
{
  int pos = 180;
  myservo.write(pos);
  AsyncWebServerResponse *response = request->beginResponse(200, "text/plain", "Servo moved!");
  response->addHeader("Access-Control-Allow-Origin", "*");
  request->send(response);
  //request->send(200, "text/plain", "Moved");

  for(int l = 0; l < 2; l++)
  {
      for (pos = 180; pos >= 100; pos -= 1) { // goes from 180 degrees to 0 degrees
      myservo.write(pos);              // tell servo to go to position in variable 'pos'
      delay(15);                       // waits 15ms for the servo to reach the position
    }
  
     for (pos = 100; pos <= 180; pos += 1) { // goes from 0 degrees to 180 degrees
      // in steps of 1 degree
      myservo.write(pos);              // tell servo to go to position in variable 'pos'
      delay(15);                       // waits 15ms for the servo to reach the position
    }
  }
  
}



/*CONNECTION SETUP*/

void connectWifi()
{
   boolean connected = false;

  // scan....
  int n = WiFi.scanNetworks();
  for (int i = 0; i < n; ++i) {
    if (WiFi.SSID(i)== ssid ) {
      WiFi.begin(ssid,password); //trying to connect the modem
      connected = true;
      break;
    }
    /*if (WiFi.SSID(i)== ssid2) {
      WiFi.begin(ssid2,password2); //trying to connect the modem
      connected = true;
      break;
    }*/
  }

  // This ssid is hidden
  //if(!connected) WiFi.begin(ssid2,password2);
  
  // Connect to WiFi network
  WiFi.mode(WIFI_STA);
  //WiFi.config(ip, gateway, subnet);
  Serial.println("");
 
  while (WiFi.status() != WL_CONNECTED) {  //Wait for connection
 
    delay(500);
    Serial.println("Waiting to connect…");
  }

  ip = WiFi.localIP();
  Serial.print("IP address: ");
  Serial.println(ip);  //Print the local IP
}

void initMDNS()
{
   if (!MDNS.begin("acg:lab:servo1")) 
   {             
     Serial.println("Error iniciando mDNS");
     while (1) {
      delay(1000);
    }
   }
   Serial.println("mDNS iniciado");
}
