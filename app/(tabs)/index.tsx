import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, TextInput } from "react-native";
import { useMMKVString } from "react-native-mmkv";

import { useIsomorphicLayoutEffect } from "usehooks-ts";

import EditScreenInfo from "../../components/EditScreenInfo";
import { Text, View } from "../../components/Themed";

import { v4 as uuidv4 } from "uuid";

// Add history of time tracking in defaultAppData.history
const defaultAppData = {
  history: [
    //
  ],
};

// const toRead = (stringData: string) => JSON.parse(stringData);
const toRead = (stringData: string) => {
  try {
    return JSON.parse(stringData);
  } catch (e) {
    console.error(e);
    return undefined;
  }
};

// const toWrite = (data: object) => JSON.stringify(data);
const toWrite = (data: object) => {
  try {
    return JSON.stringify(data);
  } catch (e) {
    console.error(e);
    return undefined;
  }
};

const useAppData = () => {
  const [appData, setAppData] = useMMKVString("appData");

  return {
    appData: appData ? toRead(appData) : null,
    setAppData: (data: object) => setAppData(toWrite(data)),
  };
};

type HistoryEntry = {
  id: string;
  start: number;
  end: number;
  duration: number;
};

type History = HistoryEntry[];

const useTimerHistory = () => {
  const { appData, setAppData } = useAppData();

  return {
    timerHistory: appData?.history ?? [],
    setTimerHistory: (history: History) => {
      setAppData({ ...appData, history });
    },
    addTimerHistoryEntry: (entry: HistoryEntry) => {
      entry = { ...entry, id: uuidv4() };

      setAppData({ ...appData, history: [...appData.history, entry] });
    },
    removeTimerHistoryEntry: (entry: HistoryEntry) => {
      setAppData({
        ...appData,
        history: appData.history.filter((e: HistoryEntry) => e.id !== entry.id),
      });
    },
  };
};

const useAppDataSetup = () => {
  const { appData, setAppData } = useAppData();

  useEffect(() => {
    if (!appData) setAppData(defaultAppData);
  }, []);
};

const displaySecondsInMinutesString = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);

  // make sure to pad with leading 0 (prevents values such as 1:3, 25:0, etc)
  const remainingSeconds =
    seconds % 60 < 10 ? `0${seconds % 60}` : seconds % 60;

  return `${minutes}:${remainingSeconds}`;
};

const minutesToSeconds = (minutes: number) => minutes * 60;

const minutesStringToSeconds = (minutesString: string) => {
  const [minutes, seconds] = minutesString.split(":");
  return minutesToSeconds(Number(minutes)) + Number(seconds);
};

export default function TimerScreen() {
  useAppDataSetup();

  const { timerHistory, setTimerHistory } = useTimerHistory();

  const [timerSessionSeconds, setTimerSessionSeconds] = useState(() =>
    minutesToSeconds(25)
  );
  console.log({ timerSessionSeconds });

  // deduce timer session value string from seconds passed
  const timerSessionValue = displaySecondsInMinutesString(timerSessionSeconds);

  console.log("🚀 ~ TimerScreen ~ timerSessionValue:", timerSessionValue);

  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // update every second if timer is running
  // useEffect(() => {
  //   if (!isTimerRunning) return;

  //   const interval = setInterval(() => {
  //     setTimerSessionSeconds((prev) => prev - 1);
  //   }, 1000);

  //   return () => clearInterval(interval);
  // }, [isTimerRunning]);

  // use useInterval hook instead of previous code to update timer
  useInterval(
    () => {
      setTimerSessionSeconds((prev) => prev - 1);
    },
    isTimerRunning ? 1000 : null
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Timer</Text>

      {/* Text Input that is actually a pomodoro timer value */}
      {/* which will be updated every second when the timer */}
      {/* is running. */}
      <View
        style={{
          width: 100,
          height: 100,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "red",
        }}
      >
        <TextInput
          style={{
            backgroundColor: "gray",
            color: "white",
            fontSize: 30,
            width: "100%",
            textAlign: "center",
          }}
          // defaultValue={timerSessionValue}
          // onChangeText={(text) => setTimerSessionValue(text)}
          value={timerSessionValue}
          // disable if timer is running
          // editable={!isTimerRunning}
          // focusable={!isTimerRunning}
          editable={false}
          focusable={false}
        />
      </View>

      <View
        style={styles.separator}
        lightColor="#eee"
        darkColor="rgba(255,255,255,0.1)"
      />

      {/* Timer Controls */}
      {/* Show start and skip when no timer is running */}
      {/* Show reset, pause, skip and when timer is running */}
      <View
        style={{
          display: "flex",
          flexDirection: "row",

          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
        }}
      >
        {isTimerRunning ? (
          <>
            <Pressable
              style={{
                padding: 10,
                backgroundColor: "darkred",
                borderRadius: 5,
              }}
            >
              <Text>Reset</Text>
            </Pressable>
            <Pressable
              style={{
                padding: 10,
                backgroundColor: "darkred",
                borderRadius: 5,
              }}
              onPress={() => {
                setIsTimerRunning(false);
              }}
            >
              <Text>Pause</Text>
            </Pressable>
            <Pressable
              style={{
                padding: 10,
                backgroundColor: "darkred",
                borderRadius: 5,
              }}
            >
              <Text>Skip</Text>
            </Pressable>
          </>
        ) : (
          <>
            <Pressable
              style={{
                padding: 10,
                backgroundColor: "darkred",
                borderRadius: 5,
              }}
              onPress={() => {
                // start timer
                setIsTimerRunning(true);
              }}
            >
              <Text>Start</Text>
            </Pressable>
            <Pressable
              style={{
                padding: 10,
                backgroundColor: "darkred",
                borderRadius: 5,
              }}
            >
              <Text>Skip</Text>
            </Pressable>
          </>
        )}
      </View>

      <View
        style={styles.separator}
        lightColor="#eee"
        darkColor="rgba(255,255,255,0.1)"
      />
      {/* <EditScreenInfo path="app/(tabs)/index.tsx" /> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
});

//
// hooks

function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef(callback);

  // Remember the latest callback if it changes.
  useLayoutEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    // Don't schedule if no delay is specified.
    // Note: 0 is a valid value for delay.
    if (!delay && delay !== 0) {
      return;
    }

    const id = setInterval(() => savedCallback.current(), delay);

    return () => clearInterval(id);
  }, [delay]);
}
