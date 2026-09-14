# 🎓 CGPA Booster

A responsive academic performance dashboard built using **HTML, CSS and JavaScript**.

## Features
- Subject-wise marks, credits and grade calculation
- Semester SGPA calculation using weighted credits
- Target CGPA planner
- Required next-semester SGPA calculation
- Performance/grade distribution
- Personalized improvement suggestions
- Study task planner with priorities and completion tracking
- Dark/light mode
- LocalStorage persistence
- Responsive UI for desktop, tablet and mobile

## Run locally

No installation is required.

1. Extract the project.
2. Open the `CGPA-Booster` folder in VS Code.
3. Double-click `index.html`, or use the **Live Server** extension.
4. Add subjects and marks.
5. Use the Target CGPA section to plan your next semester.

## Grade scale used

| Marks | Grade | Point |
|---|---|---:|
| 90–100 | O | 10 |
| 80–89 | A+ | 9 |
| 70–79 | A | 8 |
| 60–69 | B+ | 7 |
| 50–59 | B | 6 |
| 40–49 | C | 5 |
| Below 40 | F | 0 |

> Note: Grade scales differ between universities. Update `gradeFromMarks()` in `script.js` if your university uses a different grading system.

## Resume description

**CGPA Booster – Academic Performance & Goal Tracking Web App**  
Developed a responsive web application using HTML, CSS and JavaScript to calculate SGPA, plan target CGPA, analyze subject performance and generate personalized academic improvement suggestions. Implemented LocalStorage for persistent data and a study planner with task tracking and priority management.
