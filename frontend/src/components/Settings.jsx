import { useState, useEffect } from 'react';

function Settings({ onSettingsChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [workMinutes, setWorkMinutes] = useState(() => {
    return parseInt(localStorage.getItem('workMinutes')) || 25;
  });
  const [breakMinutes, setBreakMinutes] = useState(() => {
    return parseInt(localStorage.getItem('breakMinutes')) || 5;
  });
  const [soundEnabled, setSoundEnabled] = useState(() => {
    return localStorage.getItem('soundEnabled') !== 'false';
  });

  useEffect(() => {
    localStorage.setItem('workMinutes', workMinutes);
    localStorage.setItem('breakMinutes', breakMinutes);
    localStorage.setItem('soundEnabled', soundEnabled);
    onSettingsChange({ workMinutes, breakMinutes, soundEnabled });
  }, [workMinutes, breakMinutes, soundEnabled]);

  const handleReset = () => {
    setWorkMinutes(25);
    setBreakMinutes(5);
    setSoundEnabled(true);
  };

  return (
    <>
      <button className="settings-button" onClick={() => setIsOpen(!isOpen)}>
        ⚙️ Settings
      </button>

      {isOpen && (
        <div className="settings-modal-overlay" onClick={() => setIsOpen(false)}>
          <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
            <div className="settings-header">
              <h3>⚙️ Settings</h3>
              <button className="close-button" onClick={() => setIsOpen(false)}>
                ✕
              </button>
            </div>

            <div className="settings-content">
              <div className="setting-group">
                <label htmlFor="work-minutes">
                  Work Duration (minutes)
                </label>
                <input
                  id="work-minutes"
                  type="number"
                  min="1"
                  max="60"
                  value={workMinutes}
                  onChange={(e) => setWorkMinutes(parseInt(e.target.value) || 1)}
                  className="setting-input"
                />
              </div>

              <div className="setting-group">
                <label htmlFor="break-minutes">
                  Break Duration (minutes)
                </label>
                <input
                  id="break-minutes"
                  type="number"
                  min="1"
                  max="30"
                  value={breakMinutes}
                  onChange={(e) => setBreakMinutes(parseInt(e.target.value) || 1)}
                  className="setting-input"
                />
              </div>

              <div className="setting-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={soundEnabled}
                    onChange={(e) => setSoundEnabled(e.target.checked)}
                    className="setting-checkbox"
                  />
                  <span>Enable notification sounds</span>
                </label>
              </div>

              <div className="settings-actions">
                <button onClick={handleReset} className="reset-settings-button">
                  Reset to Defaults
                </button>
                <button onClick={() => setIsOpen(false)} className="done-button">
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Settings;

