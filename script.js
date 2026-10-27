
const DAILY_KEY = "fitlifeDaily";
const GOAL_KEY = "fitlifeGoal";

function localDateKey() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function freshDay() {
  return {
    date: localDateKey(),
    steps: 0,
    water: 0,
    exercises: [false, false, false, false, false, false]
  };
}

function loadDailyData() {
  let data;

  try {
    data = JSON.parse(localStorage.getItem(DAILY_KEY));
  } catch {
    data = null;
  }

  // Automatically start a new daily record when the date changes.
  if (!data || data.date !== localDateKey()) {
    data = freshDay();
    localStorage.setItem(DAILY_KEY, JSON.stringify(data));
  }

  if (!Array.isArray(data.exercises) || data.exercises.length !== 6) {
    data.exercises = [false, false, false, false, false, false];
  }

  return data;
}

let daily = loadDailyData();
let goal = Number(localStorage.getItem(GOAL_KEY)) || 5000;

const stepInput = document.getElementById("stepInput");
const goalInput = document.getElementById("goalInput");
const exerciseBoxes = [...document.querySelectorAll(".exercise")];

function saveDailyData() {
  daily.date = localDateKey();
  localStorage.setItem(DAILY_KEY, JSON.stringify(daily));
}

function renderWater() {
  const cups = document.getElementById("waterCups");
  cups.replaceChildren();

  for (let i = 0; i < 8; i++) {
    const cup = document.createElement("span");
    cup.className = "cup" + (i < daily.water ? " filled" : "");
    cup.setAttribute("aria-label", i < daily.water ? "Glass recorded" : "Empty glass");
    cups.appendChild(cup);
  }
}

function render() {
  const completed = daily.exercises.filter(Boolean).length;
  const progress = Math.min(100, daily.steps / goal * 100);
  const remaining = Math.max(0, goal - daily.steps);

  document.getElementById("today").textContent =
    new Date().toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });

  document.getElementById("steps").textContent =
    daily.steps.toLocaleString();

  document.getElementById("stepBar").style.width = progress + "%";

  document.getElementById("stepMessage").textContent =
    daily.steps >= goal
      ? "Goal reached! Great work! 🎉"
      : `${remaining.toLocaleString()} steps left to reach your goal`;

  document.getElementById("waterCount").textContent = daily.water;
  document.getElementById("summarySteps").textContent =
    daily.steps.toLocaleString();
  document.getElementById("summaryWater").textContent =
    `${daily.water}/8`;
  document.getElementById("summaryWorkout").textContent =
    `${completed}/6`;

  document.getElementById("motivation").textContent =
    completed === 6
      ? "Wonderful! You completed all six activities! 🌟"
      : completed > 0
        ? "Well done. Every healthy habit counts! 💚"
        : "Start gently and celebrate your progress.";

  goalInput.value = goal;

  exerciseBoxes.forEach((box, index) => {
    box.checked = Boolean(daily.exercises[index]);
  });

  renderWater();
}

function saveSteps() {
  const value = stepInput.value.trim();
  const steps = Number(value);

  if (value === "" || !Number.isSafeInteger(steps) || steps < 0) {
    alert("Enter a valid whole number of steps.");
    return;
  }

  daily.steps = steps;
  saveDailyData();
  render();
  stepInput.value = "";
}

document.getElementById("updateSteps").addEventListener("click", saveSteps);

stepInput.addEventListener("keydown", event => {
  if (event.key === "Enter") saveSteps();
});

document.getElementById("saveGoal").addEventListener("click", () => {
  const value = goalInput.value.trim();
  const newGoal = Number(value);

  if (value === "" || !Number.isSafeInteger(newGoal) || newGoal < 100) {
    alert("Choose a daily goal of at least 100 steps.");
    return;
  }

  goal = newGoal;
  localStorage.setItem(GOAL_KEY, String(goal));
  render();
});

document.getElementById("addWater").addEventListener("click", () => {
  if (daily.water < 8) {
    daily.water++;
    saveDailyData();
    render();
  } else {
    alert("You have recorded 8 glasses. Your water needs may vary.");
  }
});

document.getElementById("undoWater").addEventListener("click", () => {
  if (daily.water > 0) {
    daily.water--;
    saveDailyData();
    render();
  }
});

exerciseBoxes.forEach((box, index) => {
  box.addEventListener("change", () => {
    daily.exercises[index] = box.checked;
    saveDailyData();
    render();
  });
});

document.getElementById("resetDay").addEventListener("click", () => {
  if (!confirm("Reset today's steps, water, and workouts? Your step goal will stay the same.")) {
    return;
  }

  daily = freshDay();
  saveDailyData();
  render();
});

// Check again when the app is opened or brought back into view.
function checkForNewDay() {
  if (daily.date !== localDateKey()) {
    daily = freshDay();
    saveDailyData();
    render();
  }
}

document.addEventListener("visibilitychange", () => {
  if (!document.hidden) checkForNewDay();
});

window.addEventListener("pageshow", checkForNewDay);

render();
