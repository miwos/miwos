#ifndef Button_h
#define Button_h

class Button {
private:
  byte pin;
  bool state = false;
  uint32_t lastPressed = 0;
  uint32_t longClickDuration = 2000;

public:
  enum Type { ActiveLow, ActiveHigh };
  Type type = Type::ActiveLow;
  enum Event { EventNone, EventPress, EventClick, EventLongClick };

  Button(byte pin) {
    this->pin = pin;
  }

  void begin() {
    pinMode(pin, INPUT_PULLUP);
  }

  bool read() {
    bool value = digitalRead(pin);
    return type == Type::ActiveHigh ? value : !value;
  }

  bool read(bool &changed) {
    bool oldState = state;
    state = read();
    changed = state != oldState;
    return state;
  }

  Event check() {
    bool changed;
    read(changed);
    if (!changed) return EventNone;

    if (state) {
      lastPressed = millis();
      return EventPress;
    } else {
      uint32_t duration = millis() - lastPressed;
      return duration >= longClickDuration ? EventLongClick : EventClick;
    }
  }
};

#endif