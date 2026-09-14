const STORAGE_KEY = "cgpaBoosterData";

const defaultData = {
  subjects: [],
  semesters: [],
  target: 8.5,
  plannerCurrent: "",
  completedCredits: "",
  nextCredits: 20,
  tasks: [],
  dark: false
};

let data = loadData();

function loadData() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));

    return {
      ...defaultData,
      ...(saved || {}),
      subjects: saved?.subjects || [],
      semesters: saved?.semesters || [],
      tasks: saved?.tasks || []
    };
  } catch {
    return {
      ...defaultData,
      subjects: [],
      semesters: [],
      tasks: []
    };
  }
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function showToast(message) {
  const toast = document.getElementById("toast");

  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(showToast.timer);

  showToast.timer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2200);
}


/* =========================
   GRADE CALCULATION
========================= */

function gradeFromMarks(marks) {
  const m = Number(marks);

  if (m >= 90) return { grade: "O", point: 10 };
  if (m >= 80) return { grade: "A+", point: 9 };
  if (m >= 70) return { grade: "A", point: 8 };
  if (m >= 60) return { grade: "B+", point: 7 };
  if (m >= 50) return { grade: "B", point: 6 };
  if (m >= 40) return { grade: "C", point: 5 };

  return { grade: "F", point: 0 };
}


/* =========================
   SUBJECT MANAGEMENT
========================= */

function addSubject(subject = {}) {
  data.subjects.push({
    id: Date.now() + Math.random(),
    name: subject.name || "",
    credits: subject.credits ?? 3,
    marks: subject.marks ?? 80
  });

  saveData();
  render();

  showToast("Subject added");
}

function removeSubject(id) {
  data.subjects = data.subjects.filter(s => s.id !== id);

  saveData();
  render();

  showToast("Subject removed");
}

function updateSubject(id, field, value) {
  const subject = data.subjects.find(s => s.id === id);

  if (!subject) return;

  subject[field] =
    field === "name" ? value : Number(value);

  saveData();
  render();
}


/* =========================
   SGPA CALCULATION
========================= */

function calculateSGPA() {
  let credits = 0;
  let weighted = 0;

  data.subjects.forEach(subject => {
    const c = Number(subject.credits) || 0;
    const p = gradeFromMarks(subject.marks).point;

    credits += c;
    weighted += c * p;
  });

  return {
    credits,
    weighted,
    sgpa: credits ? weighted / credits : 0
  };
}


/* =========================
   TARGET CGPA CALCULATION
========================= */

function calculateRequiredSGPA(
  current,
  completed,
  target,
  nextCredits
) {
  if (!completed || !nextCredits) {
    return null;
  }

  const needed =
    (
      target * (completed + nextCredits) -
      current * completed
    ) / nextCredits;

  return needed;
}


/* =========================
   SEMESTER MANAGEMENT
========================= */

function addSemester() {
  const semester =
    Number(document.getElementById("semesterNumber").value);

  const sgpa =
    Number(document.getElementById("semesterSgpa").value);

  const credits =
    Number(document.getElementById("semesterCredits").value);


  if (!semester || !sgpa || !credits) {
    showToast("Please enter semester, SGPA and credits");
    return;
  }


  if (semester < 1 || semester > 20) {
    showToast("Semester must be between 1 and 20");
    return;
  }


  if (sgpa < 0 || sgpa > 10) {
    showToast("SGPA must be between 0 and 10");
    return;
  }


  if (credits <= 0) {
    showToast("Credits must be greater than 0");
    return;
  }


  /* Prevent duplicate semester */

  const alreadyExists =
    data.semesters.some(
      s => Number(s.semester) === semester
    );

  if (alreadyExists) {
    showToast("This semester already exists");
    return;
  }


  data.semesters.push({
    id: Date.now() + Math.random(),
    semester,
    sgpa,
    credits
  });


  /* Sort semesters */

  data.semesters.sort(
    (a, b) => Number(a.semester) - Number(b.semester)
  );


  saveData();


  /* Clear form */

  document.getElementById("semesterNumber").value = "";
  document.getElementById("semesterSgpa").value = "";
  document.getElementById("semesterCredits").value = "";


  /* Hide form */

  document
    .getElementById("semesterForm")
    .classList.remove("active");


  renderSemesters();

  showToast("Semester added successfully");
}


function removeSemester(id) {
  data.semesters =
    data.semesters.filter(
      semester => semester.id !== id
    );

  saveData();

  renderSemesters();

  showToast("Semester removed");
}


function calculateOverallCGPA() {
  let totalWeighted = 0;
  let totalCredits = 0;

  data.semesters.forEach(semester => {
    totalWeighted +=
      Number(semester.sgpa) *
      Number(semester.credits);

    totalCredits +=
      Number(semester.credits);
  });


  return {
    cgpa:
      totalCredits
        ? totalWeighted / totalCredits
        : 0,

    credits: totalCredits
  };
}


function getPerformanceLabel(sgpa) {
  const value = Number(sgpa);

  if (value >= 9) return "Excellent 🔥";
  if (value >= 8) return "Very Good";
  if (value >= 7) return "Good";
  if (value >= 6) return "Average";
  if (value >= 5) return "Needs Improvement";

  return "Needs Focus";
}


/* =========================
   RENDER SEMESTERS
========================= */

function renderSemesters() {
  const container =
    document.getElementById("semesterContainer");

  const count =
    document.getElementById("semesterCount");

  const overall =
    document.getElementById("overallCgpa");

  const creditsTotal =
    document.getElementById("semesterCreditsTotal");


  if (
    !container ||
    !count ||
    !overall ||
    !creditsTotal
  ) {
    return;
  }


  /* No semesters */

  if (!data.semesters.length) {

    container.innerHTML = `
      <div class="empty-state" style="padding:20px;">
        <div>📊</div>

        <h4>No semester history yet</h4>

        <p>
          Add your semester SGPA and credits
          to track your academic progress.
        </p>
      </div>
    `;

  } else {

    container.innerHTML =
      data.semesters.map(semester => `

        <div class="semester-card">

          <div>
            <span>Semester</span>
            <strong>
              ${semester.semester}
            </strong>
          </div>


          <div>
            <span>SGPA</span>
            <strong>
              ${Number(semester.sgpa).toFixed(2)}
            </strong>
          </div>


          <div>
            <span>Credits</span>
            <strong>
              ${semester.credits}
            </strong>
          </div>


          <div>
            <span>Performance</span>
            <strong>
              ${getPerformanceLabel(semester.sgpa)}
            </strong>
          </div>


          <button
            type="button"
            class="remove-btn"
            data-semester-remove="${semester.id}"
            title="Remove semester"
          >
            ×
          </button>

        </div>

      `).join("");


    /* Remove semester buttons */

    container
      .querySelectorAll("[data-semester-remove]")
      .forEach(button => {

        button.addEventListener("click", () => {

          removeSemester(
            Number(
              button.dataset.semesterRemove
            )
          );

        });

      });
  }


  const result =
    calculateOverallCGPA();


  count.textContent =
    data.semesters.length;

  overall.textContent =
    result.cgpa.toFixed(2);

  creditsTotal.textContent =
    result.credits;
}


/* =========================
   RENDER SUBJECTS
========================= */

function renderSubjects() {

  const body =
    document.getElementById("subjectTableBody");

  const empty =
    document.getElementById("emptyState");

  if (!body || !empty) return;

  body.innerHTML = "";

  empty.style.display =
    data.subjects.length
      ? "none"
      : "block";


  data.subjects.forEach(subject => {

    const info =
      gradeFromMarks(subject.marks);


    const tr =
      document.createElement("tr");


    tr.innerHTML = `

      <td>
        <input
          type="text"
          value="${escapeHtml(subject.name)}"
          placeholder="e.g. DBMS"
          data-id="${subject.id}"
          data-field="name"
        >
      </td>


      <td>
        <input
          type="number"
          min="1"
          max="20"
          value="${subject.credits}"
          data-id="${subject.id}"
          data-field="credits"
        >
      </td>


      <td>
        <input
          type="number"
          min="0"
          max="100"
          value="${subject.marks}"
          data-id="${subject.id}"
          data-field="marks"
        >
      </td>


      <td>
        <span class="grade-badge">
          ${info.grade}
        </span>
      </td>


      <td>
        <strong>
          ${info.point.toFixed(1)}
        </strong>
      </td>


      <td>

        <button
          type="button"
          class="remove-btn"
          data-remove="${subject.id}"
          title="Remove"
        >
          ×
        </button>

      </td>

    `;


    body.appendChild(tr);
  });


  /* Subject input updates */

  body
    .querySelectorAll("input")
    .forEach(input => {

      input.addEventListener(
        "change",
        event => {

          updateSubject(
            Number(event.target.dataset.id),
            event.target.dataset.field,
            event.target.value
          );

        }
      );

    });


  /* Remove subject */

  body
    .querySelectorAll("[data-remove]")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          removeSubject(
            Number(button.dataset.remove)
          );

        }
      );

    });
}


/* =========================
   RENDER STATS
========================= */

function renderStats() {

  const result =
    calculateSGPA();

  const sgpa =
    result.sgpa;


  const currentCgpa =
    document.getElementById("currentCgpa");

  const sgpaResult =
    document.getElementById("sgpaResult");

  const weightedPoints =
    document.getElementById("weightedPoints");

  const totalCredits =
    document.getElementById("totalCredits");

  const subjectCount =
    document.getElementById("subjectCount");


  if (
    !currentCgpa ||
    !sgpaResult ||
    !weightedPoints ||
    !totalCredits ||
    !subjectCount
  ) {
    return;
  }


  currentCgpa.textContent =
    sgpa.toFixed(2);

  sgpaResult.textContent =
    sgpa.toFixed(2);

  weightedPoints.textContent =
    result.weighted.toFixed(2);

  totalCredits.textContent =
    result.credits;

  subjectCount.textContent =
    `${data.subjects.length} subject${
      data.subjects.length === 1
        ? ""
        : "s"
    }`;


  const status =
    document.getElementById("currentStatus");


  if (status) {

    if (!data.subjects.length) {
      status.textContent =
        "Add subjects to begin";
    }

    else if (sgpa >= 9) {
      status.textContent =
        "Excellent performance 🔥";
    }

    else if (sgpa >= 8) {
      status.textContent =
        "Strong performance";
    }

    else if (sgpa >= 7) {
      status.textContent =
        "Good — keep improving";
    }

    else if (sgpa >= 5) {
      status.textContent =
        "Needs improvement";
    }

    else {
      status.textContent =
        "Focus on core subjects";
    }
  }


  const target =
    Number(data.target || 0);


  const targetDisplay =
    document.getElementById(
      "targetCgpaDisplay"
    );

  const heroTarget =
    document.getElementById(
      "heroTarget"
    );

  const targetGap =
    document.getElementById(
      "targetGap"
    );


  if (targetDisplay) {
    targetDisplay.textContent =
      target.toFixed(2);
  }

  if (heroTarget) {
    heroTarget.textContent =
      target.toFixed(2);
  }


  if (targetGap) {

    const gap =
      target - sgpa;

    targetGap.textContent =
      data.subjects.length
        ? gap <= 0
          ? "Target achieved 🎉"
          : `${gap.toFixed(2)} points to go`
        : "Set your target";
  }
}


/* =========================
   TARGET PLANNER
========================= */

function renderPlanner() {

  const current =
    Number(data.plannerCurrent);

  const completed =
    Number(data.completedCredits);

  const target =
    Number(data.target);

  const next =
    Number(data.nextCredits);


  const plannerCurrent =
    document.getElementById(
      "plannerCurrent"
    );

  const completedCredits =
    document.getElementById(
      "completedCredits"
    );

  const plannerTarget =
    document.getElementById(
      "plannerTarget"
    );

  const nextCredits =
    document.getElementById(
      "nextCredits"
    );


  if (
    !plannerCurrent ||
    !completedCredits ||
    !plannerTarget ||
    !nextCredits
  ) {
    return;
  }


  plannerCurrent.value =
    data.plannerCurrent;

  completedCredits.value =
    data.completedCredits;

  plannerTarget.value =
    target;

  nextCredits.value =
    next;


  const required =
    calculateRequiredSGPA(
      current,
      completed,
      target,
      next
    );


  const value =
    document.getElementById(
      "targetSgpaValue"
    );

  const message =
    document.getElementById(
      "targetMessage"
    );

  const requiredTop =
    document.getElementById(
      "requiredSgpa"
    );


  if (
    !value ||
    !message ||
    !requiredTop
  ) {
    return;
  }


  if (
    required === null ||
    !Number.isFinite(required)
  ) {

    value.textContent = "—";
    requiredTop.textContent = "—";

    message.textContent =
      "Enter your completed credits and current CGPA.";

  }

  else if (required > 10) {

    value.textContent = ">10";
    requiredTop.textContent = ">10";

    message.textContent =
      "This target cannot be reached in one semester. Consider extending the goal.";

  }

  else if (required <= 0) {

    value.textContent = "0.00";
    requiredTop.textContent = "0.00";

    message.textContent =
      "Your target is already secured based on these values.";

  }

  else {

    value.textContent =
      required.toFixed(2);

    requiredTop.textContent =
      required.toFixed(2);

    message.textContent =
      `Aim for ${required.toFixed(2)} SGPA in your next ${next} credits.`;
  }


  const progress =
    target
      ? Math.max(
          0,
          Math.min(
            100,
            (current / target) * 100
          )
        )
      : 0;


  const progressBar =
    document.getElementById(
      "progressBar"
    );

  const progressText =
    document.getElementById(
      "progressText"
    );


  if (progressBar) {
    progressBar.style.width =
      `${progress}%`;
  }

  if (progressText) {
    progressText.textContent =
      `${Math.round(progress)}%`;
  }
}


/* =========================
   PERFORMANCE ANALYSIS
========================= */

function renderAnalysis() {

  const sgpa =
    calculateSGPA().sgpa;


  const donutValue =
    document.getElementById(
      "donutValue"
    );

  const donutChart =
    document.getElementById(
      "donutChart"
    );


  if (donutValue) {
    donutValue.textContent =
      sgpa.toFixed(2);
  }


  if (donutChart) {

    donutChart.style.setProperty(
      "--percent",
      `${Math.max(
        0,
        Math.min(
          100,
          sgpa * 10
        )
      ) * 3.6}deg`
    );
  }


  const counts = {
    O: 0,
    "A+": 0,
    A: 0,
    "B+": 0,
    B: 0,
    C: 0,
    F: 0
  };


  data.subjects.forEach(subject => {

    counts[
      gradeFromMarks(
        subject.marks
      ).grade
    ]++;

  });


  const max =
    Math.max(
      1,
      ...Object.values(counts)
    );


  const gradeList =
    document.getElementById(
      "gradeList"
    );


  if (!gradeList) return;


  gradeList.innerHTML =
    Object.entries(counts)

      .filter(
        ([_, count]) => count > 0
      )

      .map(
        ([grade, count]) => `

          <div class="grade-row">

            <strong>${grade}</strong>

            <div class="grade-track">
              <span
                style="width:${
                  (count / max) * 100
                }%"
              ></span>
            </div>

            <span>${count}</span>

          </div>

        `
      )
      .join("")

      ||

      `<p style="color:var(--muted);font-size:11px;">
        Add subjects to see grade distribution.
      </p>`;
}


/* =========================
   IMPROVEMENT SUGGESTIONS
========================= */

function renderSuggestions() {

  const suggestions = [];


  const sorted =
    [...data.subjects].sort(
      (a, b) =>
        Number(a.marks) -
        Number(b.marks)
    );


  const weak =
    sorted
      .filter(
        subject =>
          Number(subject.marks) < 70
      )
      .slice(0, 3);


  if (!data.subjects.length) {

    suggestions.push([
      "📌",
      "Start with your subjects",
      "Add your subjects and marks to receive a personalized improvement plan."
    ]);

  }

  else {

    if (weak.length) {

      suggestions.push([
        "🎯",
        "Focus on weak subjects",
        `Prioritize ${
          weak
            .map(
              subject =>
                subject.name ||
                "unnamed subject"
            )
            .join(", ")
        } and target 70%+.`
      ]);

    }

    else {

      suggestions.push([
        "🔥",
        "Maintain your consistency",
        "All entered subjects are at 70% or above. Keep revision regular."
      ]);

    }


    const sgpa =
      calculateSGPA().sgpa;


    if (sgpa < 7) {

      suggestions.push([
        "📚",
        "Build a daily study routine",
        "Start with 2 focused study blocks per day and revise difficult topics weekly."
      ]);

    }

    else if (sgpa < 8.5) {

      suggestions.push([
        "⚡",
        "Push your strongest subjects higher",
        "Convert your B+/A grades into A/A+ with practice tests and active recall."
      ]);

    }

    else {

      suggestions.push([
        "🏆",
        "Protect your high performance",
        "Use mock tests and weekly revision to keep your SGPA above your target."
      ]);

    }


    suggestions.push([
      "📝",
      "Track assignments and exams",
      "Use the Study Planner below to schedule important subjects and study hours."
    ]);
  }


  const container =
    document.getElementById(
      "suggestions"
    );


  if (!container) return;


  container.innerHTML =
    suggestions
      .map(
        item => `

          <div class="suggestion">

            <div class="suggestion-icon">
              ${item[0]}
            </div>

            <div>
              <strong>${item[1]}</strong>
              <p>${item[2]}</p>
            </div>

          </div>

        `
      )
      .join("");
}


/* =========================
   STUDY TASKS
========================= */

function renderTasks() {

  const container =
    document.getElementById(
      "tasksContainer"
    );


  if (!container) return;


  if (!data.tasks.length) {

    container.innerHTML = `
      <div
        class="empty-state"
        style="padding:18px;"
      >
        <p>
          No study tasks yet.
          Add one to start tracking.
        </p>
      </div>
    `;

    return;
  }


  container.innerHTML =
    data.tasks
      .map(
        task => `

          <div
            class="task ${
              task.done ? "done" : ""
            }"
          >

            <input
              class="task-check"
              type="checkbox"
              ${
                task.done
                  ? "checked"
                  : ""
              }
              data-task-check="${task.id}"
            >


            <div class="task-info">

              <strong>
                ${escapeHtml(task.name)}
              </strong>

              <small>
                ${task.hours}
                hour${
                  task.hours == 1
                    ? ""
                    : "s"
                }
                study target
              </small>

            </div>


            <span
              class="priority ${task.priority}"
            >
              ${task.priority}
            </span>


            <button
              type="button"
              class="delete-task"
              data-task-delete="${task.id}"
              title="Delete"
            >
              ✕
            </button>

          </div>

        `
      )
      .join("");


  /* Complete task */

  container
    .querySelectorAll(
      "[data-task-check]"
    )
    .forEach(element => {

      element.addEventListener(
        "change",
        event => {

          const task =
            data.tasks.find(
              item =>
                item.id ===
                Number(
                  event.target
                    .dataset
                    .taskCheck
                )
            );


          if (task) {
            task.done =
              event.target.checked;
          }


          saveData();
          renderTasks();
        }
      );

    });


  /* Delete task */

  container
    .querySelectorAll(
      "[data-task-delete]"
    )
    .forEach(element => {

      element.addEventListener(
        "click",
        () => {

          data.tasks =
            data.tasks.filter(
              task =>
                task.id !==
                Number(
                  element.dataset
                    .taskDelete
                )
            );


          saveData();
          renderTasks();

        }
      );

    });
}


/* =========================
   ESCAPE HTML
========================= */

function escapeHtml(str) {

  return String(str ?? "")
    .replace(
      /[&<>"']/g,
      character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
      }[character])
    );
}


/* =========================
   MAIN RENDER
========================= */

function render() {

  renderSubjects();

  renderStats();

  renderPlanner();

  renderAnalysis();

  renderSuggestions();

  renderTasks();

  renderSemesters();


  document.body.classList.toggle(
    "dark",
    !!data.dark
  );


  const themeToggle =
    document.getElementById(
      "themeToggle"
    );


  if (themeToggle) {

    themeToggle.textContent =
      data.dark
        ? "☀️"
        : "🌙";
  }
}


/* =========================
   SUBJECT BUTTONS
========================= */

const addSubjectBtn =
  document.getElementById(
    "addSubjectBtn"
  );

if (addSubjectBtn) {

  addSubjectBtn.addEventListener(
    "click",
    () => addSubject()
  );
}


const emptyAddBtn =
  document.getElementById(
    "emptyAddBtn"
  );

if (emptyAddBtn) {

  emptyAddBtn.addEventListener(
    "click",
    () => addSubject()
  );
}


/* =========================
   PLANNER INPUTS
========================= */

[
  "plannerCurrent",
  "completedCredits",
  "plannerTarget",
  "nextCredits"
].forEach(id => {

  const element =
    document.getElementById(id);


  if (!element) return;


  element.addEventListener(
    "input",
    event => {

      if (id === "plannerTarget") {

        data.target =
          Number(
            event.target.value
          ) || 0;

      } else {

        data[id] =
          event.target.value;
      }


      saveData();

      render();
    }
  );

});


/* =========================
   PLAN BUTTON
========================= */

const planBtn =
  document.getElementById(
    "planBtn"
  );


if (planBtn) {

  planBtn.addEventListener(
    "click",
    () => {

      data.target =
        Number(
          document.getElementById(
            "plannerTarget"
          ).value
        ) || 0;


      saveData();

      render();

      showToast(
        "Target plan calculated"
      );
    }
  );
}


/* =========================
   THEME BUTTON
========================= */

const themeToggle =
  document.getElementById(
    "themeToggle"
  );


if (themeToggle) {

  themeToggle.addEventListener(
    "click",
    () => {

      data.dark =
        !data.dark;

      saveData();

      render();
    }
  );
}


/* =========================
   RESET BUTTON
========================= */

const clearAllBtn =
  document.getElementById(
    "clearAllBtn"
  );


if (clearAllBtn) {

  clearAllBtn.addEventListener(
    "click",
    () => {

      if (
        !confirm(
          "Reset all CGPA Booster data?"
        )
      ) {
        return;
      }


      data = {
        ...defaultData,
        subjects: [],
        semesters: [],
        tasks: []
      };


      saveData();

      render();

      showToast(
        "All data reset"
      );
    }
  );
}


/* =========================
   STUDY TASK BUTTONS
========================= */

const addTaskBtn =
  document.getElementById(
    "addTaskBtn"
  );


if (addTaskBtn) {

  addTaskBtn.addEventListener(
    "click",
    () => {

      const taskForm =
        document.getElementById(
          "taskForm"
        );

      if (taskForm) {

        taskForm.classList.add(
          "active"
        );

        document
          .getElementById(
            "taskName"
          )
          ?.focus();
      }
    }
  );
}


const cancelTaskBtn =
  document.getElementById(
    "cancelTaskBtn"
  );


if (cancelTaskBtn) {

  cancelTaskBtn.addEventListener(
    "click",
    () => {

      document
        .getElementById(
          "taskForm"
        )
        ?.classList.remove(
          "active"
        );
    }
  );
}


const saveTaskBtn =
  document.getElementById(
    "saveTaskBtn"
  );


if (saveTaskBtn) {

  saveTaskBtn.addEventListener(
    "click",
    () => {

      const name =
        document
          .getElementById(
            "taskName"
          )
          .value
          .trim();


      const hours =
        Number(
          document.getElementById(
            "taskHours"
          ).value
        );


      const priority =
        document.getElementById(
          "taskPriority"
        ).value;


      if (
        !name ||
        !hours ||
        hours <= 0
      ) {

        showToast(
          "Enter a task and study hours"
        );

        return;
      }


      data.tasks.push({
        id: Date.now() + Math.random(),
        name,
        hours,
        priority,
        done: false
      });


      saveData();


      document.getElementById(
        "taskName"
      ).value = "";

      document.getElementById(
        "taskHours"
      ).value = "";


      document
        .getElementById(
          "taskForm"
        )
        .classList.remove(
          "active"
        );


      renderTasks();

      showToast(
        "Study task added"
      );
    }
  );
}


/* =========================
   SEMESTER BUTTONS
========================= */

const addSemesterBtn =
  document.getElementById(
    "addSemesterBtn"
  );

const semesterForm =
  document.getElementById(
    "semesterForm"
  );


/* ADD SEMESTER */

if (
  addSemesterBtn &&
  semesterForm
) {

  addSemesterBtn.addEventListener(
    "click",
    () => {

      semesterForm.classList.add(
        "active"
      );


      document
        .getElementById(
          "semesterNumber"
        )
        ?.focus();
    }
  );
}


/* CANCEL SEMESTER */

const cancelSemesterBtn =
  document.getElementById(
    "cancelSemesterBtn"
  );


if (cancelSemesterBtn) {

  cancelSemesterBtn.addEventListener(
    "click",
    () => {

      document
        .getElementById(
          "semesterForm"
        )
        ?.classList.remove(
          "active"
        );
    }
  );
}


/* SAVE SEMESTER */

const saveSemesterBtn =
  document.getElementById(
    "saveSemesterBtn"
  );


if (saveSemesterBtn) {

  saveSemesterBtn.addEventListener(
    "click",
    addSemester
  );
}


/* =========================
   START APPLICATION
========================= */

render();