#include <SPI.h>
#include <ESP8266WiFi.h>
#include <WiFiClientSecure.h>
#include <ESP8266HTTPClient.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <EEPROM.h>

// ==== WiFi & Server Settings ====
const char* ssids[] = {"Airtel_GuessWho"};
const char* passwords[] = {"YouWillNeverGuess@1t"};
const int wifiCount = sizeof(ssids) / sizeof(ssids[0]);

const char* server = "https://iot-22lr.vercel.app/api/log/";
const char* replyServer = "https://iot-22lr.vercel.app/api/reply/";
// ==== OLED ====
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

// ==== Buttons ====
#define BUTTON_SEND D7
#define BUTTON_READ D6

// ==== States ====
bool postSendDelay = false;
unsigned long postSendTime = 0;
bool unread = false;
bool displayMessage = false;
bool idleEnabled = false;
unsigned long messageDisplayStart = 0;
unsigned long lastFetch = 0;
unsigned long lastBlinkTime = 0;
bool isBlinking = false;
int lastSendState = HIGH;
int lastReadState = HIGH;
unsigned long lastEyeAnimTime = 0;
int eyeAnimIndex = 0;
const int totalEyeAnims = 7; // Number of different animations

// ==== Message Variables ====
String lastMessage = "";
String pendingMessageId = "";

// ==== Eye Animation Settings ====
int ref_eye_height = 40, ref_eye_width = 40, ref_space_between_eye = 10, ref_corner_radius = 10;
int left_eye_height = ref_eye_height, left_eye_width = ref_eye_width;
int right_eye_height = ref_eye_height, right_eye_width = ref_eye_width;
int left_eye_x = 32, left_eye_y = 32;
int right_eye_x = 32 + ref_eye_width + ref_space_between_eye, right_eye_y = 32;
const int blinkInterval = 5000;

// === Function Prototypes ===
void center_eyes(bool update = true);
void draw_eyes(bool update = true);
void blink(int speed = 12);
void happy_eye();
void sleep();
void wakeup();
void sendNotification();
void fetchReply();
void blinkFullScreen();
void writeStoredId(String id);
String readStoredId();
String getTimeString();
void drawEyeAnimation();
void move_right_big_eye();
void move_left_big_eye();
void saccade(int, int);
void launch_animation_with_index(int);

void setup() {
  Serial.begin(115200);
  pinMode(BUTTON_SEND, INPUT_PULLUP);
  pinMode(BUTTON_READ, INPUT_PULLUP);
  EEPROM.begin(64);

  display.begin(SSD1306_SWITCHCAPVCC, 0x3C);
  display.clearDisplay();
  display.setCursor(0, 0);
  display.setTextSize(1);
  display.setTextColor(WHITE);
  display.println("Connecting WiFi");
  display.display();

  WiFi.mode(WIFI_STA);
  bool connected = false;
  for (int i = 0; i < wifiCount; i++) {
    display.clearDisplay();
    display.setCursor(0, 0);
    display.print("Trying: ");
    display.println(ssids[i]);
    display.display();
    Serial.print("Trying to connect to ");
    Serial.println(ssids[i]);
    WiFi.begin(ssids[i], passwords[i]);
    unsigned long startAttemptTime = millis();
    // Try for 10 seconds
    while (WiFi.status() != WL_CONNECTED && millis() - startAttemptTime < 10000) {
      delay(500);
      display.print(".");
      display.display();
    }
    if (WiFi.status() == WL_CONNECTED) {
      display.clearDisplay();
      display.setCursor(0, 0);
      display.println("WiFi Connected");
      display.println(ssids[i]);
      display.display();
      Serial.print("Connected to ");
      Serial.println(ssids[i]);
      connected = true;
      break;
    }
  }
  if (!connected) {
    display.clearDisplay();
    display.setCursor(0, 0);
    display.println("WiFi Failed");
    display.display();
    Serial.println("Could not connect to any WiFi network.");
    // Optionally, restart or go into deep sleep here
    while (1) delay(1000);
  }
  delay(1000);
  center_eyes();
  idleEnabled = true;
}

void loop() {
  bool isSendPressed = digitalRead(BUTTON_SEND) == LOW;
  bool isReadPressed = digitalRead(BUTTON_READ) == LOW;

  // Handle A button press (send)
  if (isSendPressed && lastSendState == HIGH) {
    idleEnabled = false;
    display.invertDisplay(false);
    display.clearDisplay();
    display.setCursor(0, 0);
    display.setTextSize(1);
    display.println("Button Pressed");
    display.display();
    sendNotification();
    postSendDelay = true;
    postSendTime = millis();  // start 2-sec timer
  }

  // Handle B button press (read)
  if (isReadPressed && lastReadState == HIGH && unread) {
    idleEnabled = false;
    writeStoredId(pendingMessageId);
    unread = false;
    displayMessage = true;
    messageDisplayStart = millis();
    display.invertDisplay(false);
    display.clearDisplay();
    display.setCursor(0, 0);
    display.println("New Message:");
    display.setCursor(0, 20);
    display.println(lastMessage);
    display.display();
  }

  lastSendState = !isSendPressed ? HIGH : LOW;
  lastReadState = !isReadPressed ? HIGH : LOW;

  // Handle reply check
  if (millis() - lastFetch >= 2000) {
    fetchReply();
    lastFetch = millis();
  }

  // Handle new message screen blinking
  if (unread) {
    idleEnabled = false;
    blinkFullScreen();
  }
  // Display message for 7 sec, then go idle
  else if (displayMessage && millis() - messageDisplayStart >= 7000) {
    display.clearDisplay();
    display.display();
    displayMessage = false;
    idleEnabled = true;
  }
  // Handle 2 sec delay after "Button Pressed" before idle animation
  else if (postSendDelay && millis() - postSendTime >= 2000) {
    postSendDelay = false;
    idleEnabled = true;
  }
  // Show eye animation during idle
  else if (idleEnabled && !postSendDelay && !unread && !displayMessage) {
    drawEyeAnimation();
  }

  delay(10);
}


// === Eye Animation Functions ===
void draw_eyes(bool update) {
  display.clearDisplay();
  display.fillRoundRect(left_eye_x - left_eye_width / 2, left_eye_y - left_eye_height / 2, left_eye_width, left_eye_height, ref_corner_radius, SSD1306_WHITE);
  display.fillRoundRect(right_eye_x - right_eye_width / 2, right_eye_y - right_eye_height / 2, right_eye_width, right_eye_height, ref_corner_radius, SSD1306_WHITE);
  if (update) display.display();
}

void center_eyes(bool update) {
  left_eye_x = SCREEN_WIDTH / 2 - ref_eye_width / 2 - ref_space_between_eye / 2;
  right_eye_x = SCREEN_WIDTH / 2 + ref_eye_width / 2 + ref_space_between_eye / 2;
  left_eye_y = right_eye_y = SCREEN_HEIGHT / 2;
  left_eye_width = right_eye_width = ref_eye_width;
  left_eye_height = right_eye_height = ref_eye_height;
  draw_eyes(update);
}

void blink(int speed) {
  for (int i = 0; i < 3; i++) {
    left_eye_height -= speed;
    right_eye_height -= speed;
    draw_eyes();
    delay(1);
  }
  for (int i = 0; i < 3; i++) {
    left_eye_height += speed;
    right_eye_height += speed;
    draw_eyes();
    delay(1);
  }
}

void happy_eye() {
  center_eyes(false);
  int offset = ref_eye_height / 2;
  for (int i = 0; i < 10; i++) {
    display.fillTriangle(left_eye_x - left_eye_width / 2, left_eye_y + offset,
                         left_eye_x + left_eye_width / 2, left_eye_y + 5 + offset,
                         left_eye_x - left_eye_width / 2, left_eye_y + left_eye_height + offset,
                         SSD1306_BLACK);

    display.fillTriangle(right_eye_x + right_eye_width / 2, right_eye_y + offset,
                         right_eye_x - left_eye_width / 2, right_eye_y + 5 + offset,
                         right_eye_x + right_eye_width / 2, right_eye_y + right_eye_height + offset,
                         SSD1306_BLACK);
    offset -= 2;
    display.display();
    delay(1);
  }
}

void sleep() {
  left_eye_height = right_eye_height = 2;
  draw_eyes(true);
}

void wakeup() {
  sleep();
  for (int h = 0; h <= ref_eye_height; h += 2) {
    left_eye_height = right_eye_height = h;
    draw_eyes(true);
  }
}

void saccade(int dx, int dy) {
  left_eye_x += dx * 5;
  right_eye_x += dx * 5;
  left_eye_y += dy * 5;
  right_eye_y += dy * 5;
  draw_eyes();
  delay(100);
  center_eyes();
}

void drawEyeAnimation() {
  // Run a different eye animation every 20 seconds
  if (millis() - lastEyeAnimTime > 20000) {
    switch (eyeAnimIndex) {
      case 0:
        blink(10);
        break;
      case 1:
        happy_eye();
        break;
      case 2:
        sleep();
        delay(500); // show sleep for a moment
        wakeup();
        break;
      case 3:
        saccade(1, 0); // right
        break;
      case 4:
        saccade(-1, 0); // left
        break;
      case 5:
        saccade(0, 1); // down
        break;
      case 6:
        saccade(0, -1); // up
        break;
      // You can add more cases for move_right_big_eye, move_left_big_eye, launch_animation_with_index, etc.
    }
    eyeAnimIndex = (eyeAnimIndex + 1) % totalEyeAnims;
    lastEyeAnimTime = millis();
  } else {
    draw_eyes(true);
  }
}

void blinkFullScreen() {
  static unsigned long lastBlink = 0;
  static bool inverted = false;

  if (millis() - lastBlink >= 300) {
    display.invertDisplay(inverted);
    inverted = !inverted;
    lastBlink = millis();
  }
}

// === Network & EEPROM ===
void sendNotification() {
  if (WiFi.status() == WL_CONNECTED) {
    WiFiClientSecure client;
    client.setInsecure();
    HTTPClient http;
    http.begin(client, server);
    http.addHeader("Content-Type", "application/json");
    String json = "{\"message\":\"She pressed the button\"}";
    int httpCode = http.POST(json);
    display.clearDisplay();
    display.setCursor(0, 0);
    display.setTextSize(2);
    if (httpCode == 200) {
      display.println("\x03 Sent!"); // checkmark
      display.setTextSize(1);
      display.println("Message delivered");
    } else {
      display.println("\x18 Error"); // X mark
      display.setTextSize(1);
      display.print("Send failed: ");
      display.println(httpCode);
    }
    display.display();
    delay(1200);
    display.setTextSize(1);
    display.clearDisplay();
    display.display();
    http.end();
  }
}

void fetchReply() {
  if (WiFi.status() == WL_CONNECTED) {
    WiFiClientSecure client;
    client.setInsecure();
    HTTPClient http;
    http.begin(client, replyServer);
    int httpCode = http.GET();
    if (httpCode == 200) {
      String payload = http.getString();
      int msgStart = payload.indexOf("\"message\":\") + 11;
      int msgEnd = payload.indexOf("\"", msgStart);
      String msg = payload.substring(msgStart, msgEnd);

      int idStart = payload.indexOf("\"id\":\") + 6;
      int idEnd = payload.indexOf("\"", idStart);
      String msgId = payload.substring(idStart, idEnd);

      if (msgId != readStoredId()) {
        lastMessage = msg;
        pendingMessageId = msgId;
        unread = true;
        Serial.println("New message received: " + msg);
        // Show notification on OLED
        display.clearDisplay();
        display.setCursor(0, 0);
        display.setTextSize(2);
        display.println("\x10 New!"); // envelope icon
        display.setTextSize(1);
        display.println("Message received:");
        display.setTextSize(1);
        display.println(msg);
        display.display();
        delay(2000);
        display.setTextSize(1);
        display.clearDisplay();
        display.display();
      }
    }
    http.end();
  }
}

void writeStoredId(String id) {
  for (int i = 0; i < id.length(); i++) EEPROM.write(i, id[i]);
  EEPROM.write(id.length(), '\0');
  EEPROM.commit();
}

String readStoredId() {
  char buffer[33];
  for (int i = 0; i < 32; i++) {
    char c = EEPROM.read(i);
    if (c == '\0') {
      buffer[i] = '\0';
      break;
    }
    buffer[i] = c;
  }
  buffer[32] = '\0';
  return String(buffer);
}

String getTimeString() {
  time_t now = time(nullptr);
  struct tm* p_tm = localtime(&now);
  char buffer[30];
  sprintf(buffer, "%04d-%02d-%02d %02d:%02d:%02d",
          p_tm->tm_year + 1900, p_tm->tm_mon + 1, p_tm->tm_mday,
          p_tm->tm_hour, p_tm->tm_min, p_tm->tm_sec);
  return String(buffer);
}
