import { useState, useEffect, useRef } from 'react';
import { TbRewindForward30, TbRewindBackward30 } from 'react-icons/tb';

function PomodoroTimer({ onComplete, workMinutes = 25, breakMinutes = 5, soundEnabled = true }) {
  const WORK_TIME = workMinutes * 60; // work minutes in seconds
  const BREAK_TIME = breakMinutes * 60;  // break minutes in seconds

  const [timeLeft, setTimeLeft] = useState(WORK_TIME);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const intervalRef = useRef(null);

  // Reset timer when settings change
  useEffect(() => {
    if (!isRunning) {
      setTimeLeft(isBreak ? BREAK_TIME : WORK_TIME);
    }
  }, [workMinutes, breakMinutes]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Timer countdown logic
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimerComplete();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  // Play notification sound
  const playNotificationSound = () => {
    if (soundEnabled) {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBCZ+zPLTgjMGHm7A7+OZURE=');
      audio.volume = 0.5;
      audio.play().catch(() => {}); // Ignore errors if sound fails
    }
  };

  const handleTimerComplete = () => {
    setIsRunning(false);
    playNotificationSound();
    
    if (!isBreak) {
      // Work session completed - notify parent
      onComplete();
      alert('🎉 Pomodoro complete! Take a break.');
      // Switch to break
      setIsBreak(true);
      setTimeLeft(BREAK_TIME);
    } else {
      // Break completed
      alert('Break over! Ready for another Pomodoro?');
      setIsBreak(false);
      setTimeLeft(WORK_TIME);
    }
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setIsBreak(false);
    setTimeLeft(WORK_TIME);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const handleSubtract30 = () => {
    setTimeLeft((prevSeconds) => {
      const newSeconds = prevSeconds - 30;
      return newSeconds < 0 ? 0 : newSeconds;
    });
  };

  const handleAdd30 = () => {
    setTimeLeft((prevSeconds) => {
      const currentMax = isBreak ? BREAK_TIME : WORK_TIME;
      const newSeconds = prevSeconds + 30;
      return newSeconds > currentMax ? currentMax : newSeconds;
    });
  };

  const formatTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return {
      minutes: minutes.toString().padStart(2, '0'),
      seconds: secs.toString().padStart(2, '0')
    };
  };

  const timeDisplay = formatTime(timeLeft);
  const totalSegments = 60;
  const currentMax = isBreak ? BREAK_TIME : WORK_TIME;
  const filledSegments = Math.floor((timeLeft / currentMax) * totalSegments);

  return (
    <div className={`pomodoro-timer ${isBreak ? 'break-mode' : 'work-mode'}`}>
      <div className="timer-mode-label">
        {isBreak ? '☕ Break Time' : '🍅 Focus Time'}
      </div>
      
      <div className="timer-controls-wrapper">
        <button 
          className="time-adjust-button"
          onClick={handleAdd30}
          aria-label="Add 30 seconds"
        >
          <TbRewindBackward30 size={50} />
        </button>

        <div className="timer-wrapper">
          <div className="progress-segments">
            {Array.from({ length: totalSegments }).map((_, index) => {
              const angle = (index * 6);
              const innerBoundRadius = 115;
              const topIndex = 1;
              const clockwiseDistanceFromTop = (index - topIndex + totalSegments) % totalSegments;
              const disappearedCount = totalSegments - filledSegments;
              const isFilled = clockwiseDistanceFromTop >= disappearedCount;
              
              return (
                <div
                  key={index}
                  className={`progress-segment ${isFilled ? 'filled' : ''} ${isBreak ? 'break' : 'work'}`}
                  style={{
                    transform: `rotate(${angle}deg) translateY(-${innerBoundRadius}px)`,
                  }}
                />
              );
            })}
          </div>

          <div className="timer-display-container">
            <div className="timer-display">
              <div className="time-value">
                <span className="time-number">{timeDisplay.minutes}</span>
                <span className="time-label">M</span>
              </div>
              <div className="time-separator">:</div>
              <div className="time-value">
                <span className="time-number">{timeDisplay.seconds}</span>
                <span className="time-label">S</span>
              </div>
            </div>
          </div>
        </div>

        <button 
          className="time-adjust-button"
          onClick={handleSubtract30}
          aria-label="Subtract 30 seconds"
        >
          <TbRewindForward30 size={50} />
        </button>
      </div>

      <div className="timer-button-group">
        <button 
          className={`timer-button ${isRunning ? 'pause' : 'start'}`}
          onClick={toggleTimer}
        >
          {isRunning ? 'Pause' : 'Start'}
        </button>
        <button 
          className="timer-button reset"
          onClick={resetTimer}
        >
          Reset
        </button>
      </div>
    </div>
  );
}

export default PomodoroTimer;
