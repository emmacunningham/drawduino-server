#include <Servo.h>
char messageBuffer[12], cmd[3], pin[3], val[4], aux[4];
boolean debug = false;
int index = 0;
Servo servo;

// Stuff for interrupts
volatile boolean fired;
volatile boolean up;

volatile boolean fired2;
volatile boolean up2;

static int rotaryCount1 = 00;
static int rotaryCount2 = 00;

#define PINA 3
#define PINB 5
#define INTERRUPT 1  // that is, pin 3

#define PINC 2
#define PIND 4
#define INTERRUPT2 0  // that is, pin 2
//

void setup() {
  Serial.begin(115200);
  
  // Stuff for interrupts
  digitalWrite (PINA, HIGH);     // enable pull-ups
  digitalWrite (PINB, HIGH); 
  attachInterrupt (INTERRUPT, isr1, CHANGE);   // interrupt 1 is pin 3

  digitalWrite (PINC, HIGH);     // enable pull-ups
  digitalWrite (PIND, HIGH); 
  attachInterrupt (INTERRUPT2, isr2, CHANGE);   // interrupt 0 is pin 2
  //
}

void loop() {

  if (fired)
    {
    if (up)
      rotaryCount1++;
    else
      rotaryCount1--;
    fired = false;
    }  // end if fired

  if (fired2)
    {
    if (up2)
      rotaryCount2++;
    else
     rotaryCount2--;
    fired2 = false;
    }  // end if fired
    
  /**
   * Waiting for commands
   */
  while(Serial.available() > 0) {
    char x = Serial.read();
    if (x == '!') index = 0;      // start
    else if (x == '.') process(); // end
    else messageBuffer[index++] = x;
  }
    
}

// Interrupt Service Routine for a change to encoder pin A
void isr1 ()
{
  if (digitalRead (PINA))
    up = digitalRead (PINB);
  else
    up = !digitalRead (PINB);
  fired = true;
}  // end of isr

// Interrupt Service Routine for a change to encoder pin C
void isr2 ()
{
  if (digitalRead (PINC))
    up2 = digitalRead (PIND);
  else
    up2 = !digitalRead (PIND);
  fired2 = true;
}  // end of isr

/**
 * Deal with a full message and determine function to call
 */
void process() {
  index = 0;
  
  strncpy(cmd, messageBuffer, 2);
  cmd[2] = '\0';
  strncpy(pin, messageBuffer + 2, 2);
  pin[2] = '\0';  
  strncpy(val, messageBuffer + 4, 3);
  val[3] = '\0';
  strncpy(aux, messageBuffer + 7, 3);
  aux[3] = '\0';
  
  if (debug) {
    //Serial.println(messageBuffer); 
  }

  int cmdid = atoi(cmd);
  
  switch(cmdid) {
    case 0:  sm(pin,val);               break;
    case 1:  dw(pin,val);               break;
    case 2:  dr(pin);                   break;
    case 3:  aw(pin,val);               break;
    case 4:  ar(pin);                   break;
    case 5:  rr(pin);                   break;    
    case 90: autoReply();               break;
    case 98: handleServo(pin,val,aux);  break;
    case 99: toggleDebug(val);          break;
    default:                            break;
  }
}

/**
 * Toggle debug mode
 * @param char val value for enabling or disabling debugger (0 = false, 1 = true)
 */
void toggleDebug(char *val) {
  if (atoi(val) == 0) {
    debug = false;
    Serial.println("goodbye");
  } else {
    debug = true;
    Serial.println("hello");
  }
}

void autoReply() {
   Serial.println('Is Dave there?'); 
}

/**
 * Set pin mode
 * @param char pin identifier for pin
 * @param char val set pit to OUTPUT or INPUT
 */
void sm(char *pin, char *val) {
  if (debug) {
    Serial.println("sm"); }
    
  int p = getPin(pin);
  if (p == -1 && debug) {
    Serial.println("badpin"); 
  } else {  
    if (atoi(val) == 0) {
      pinMode(p, OUTPUT);
    } else {
      pinMode(p, INPUT);
    }
  }
}

/**
 * Digital write
 * @param char pin identifier for pin
 * @param char val set pin to HIGH or LOW
 */
void dw(char *pin, char *val) {
  if (debug) {
    Serial.println("dw"); }
    
  int p = getPin(pin);
  if (p == -1 && debug) {
    Serial.println("badpin"); 
  } else {  
    pinMode(p, OUTPUT);
    if (atoi(val) == 0) {
      digitalWrite(p, LOW);
    } else {
      digitalWrite(p, HIGH);
    }
  }
}

/** 
 * Special Rotary read
 */
void rr(char *pin) {
  if (debug) {
    //Serial.println("rr"); 
  }
    
    // Print some stuff to serial
    char m[7];
    
    int p = getPin(pin);
    
    if (p == 3) {
      sprintf(m, "%02d::%02d", p, rotaryCount1);
    }

    if (p == 2) {
      sprintf(m, "%02d::%02d", p, rotaryCount2);
    }    

    Serial.println(m);

}

/**
 * Digital read
 * @param char pin pin identifier
 */
void dr(char *pin) {
  
  if (debug) {
    Serial.println("dr"); }
    
  int p = getPin(pin);
  if (p == -1 && debug) {
    Serial.println("badpin"); 
  } else {
    pinMode(p, INPUT);
    int oraw = digitalRead(p);
    char m[7];
    sprintf(m, "%02d::%02d", p, oraw);
    Serial.println(m);
  }
}

/**
 * Analog read
 * @param char pin pin identifier
 */
void ar(char *pin) {
  if (debug) {
    Serial.println("ar"); }

  int p = getPin(pin);
  if (p == -1 && debug) {
    Serial.println("badpin"); 
  } else {
    pinMode(p, INPUT); // don't want to sw
    int rval = analogRead(p);
    char m[8];
    sprintf(m, "%s::%03d", pin, rval);
    Serial.println(m);    
  }
}  

/*
 * Analog write
 * @param char pin pin identifier
 * @param char val value to write 
 */
void aw(char *pin, char *val) {
  if (debug) {
    Serial.println("aw"); }
    
  int p = getPin(pin);
  if (p == -1 && debug) {
    Serial.println("badpin"); 
  } else {
    pinMode(p, OUTPUT);
    analogWrite(p, atoi(val));
  }
}

int getPin(char *pin) { //Converts to A0-A5, and returns -1 on error
  int ret = -1;
  if (pin[0] == 'A' || pin[0] == 'a') {
    switch(pin[1]) {
      case '0': ret = A0; break;
      case '1': ret = A1; break;
      case '2': ret = A2; break;
      case '3': ret = A3; break;
      case '4': ret = A4; break;
      case '5': ret = A5; break;
      default:            break;
    }
  } else {
    ret = atoi(pin);
    if (ret == 0 && (pin[0] != '0' || pin[1] != '0')) {
      ret = -1; }
  }
  
  return ret;
}
  

/*
 * Handle Servo commands
 * attach, detach, write, read, writeMicroseconds, attached
 */
void handleServo(char *pin, char *val, char *aux) {
  if (debug) {
    Serial.println("ss"); }
    
  int p = getPin(pin);
  if (p == -1 && debug) {
    Serial.println("badpin"); 
  } else {
    Serial.println("got signal");
    if (atoi(val) == 0) {
      servo.detach();
    } else if (atoi(val) == 1) {
      servo.attach(p);
      Serial.println("attached");
    } else if (atoi(val) == 2) {
      Serial.println("writing to servo");
      Serial.println(atoi(aux));
      servo.write(atoi(aux));
    }  
  }
}
