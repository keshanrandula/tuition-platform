# EduLanka - Interactive Online Tuition & Learning Platform

EduLanka is a modern, premium, and highly responsive web application designed for online tutors and educational institutions to manage courses, syllabus modules, video streams, student payments, and interactive schedules.

## 🚀 Key Features

*   **Subject-Grouped Syllabus Modules**: Organized course pages displaying curriculum modules structured under specific subject headers (e.g. Mathematics, Physics).
*   **Stand-alone Subject Packages**: Support for custom crash courses and standalone subjects sold separately from the regular syllabus.
*   **Interactive Live Lectures Schedule**: A premium calendar detailing scheduled live classes with automatic countdown timers and secure meeting room links.
*   **Seamless Access Control & Lock Flow**: Visual lock indicators on restricted weeks/classes that reroute students directly to the checkout portal for easy activation.
*   **Secure Video Streaming**: Integrates a custom secure video player mapping dynamically to stream YouTube lessons or custom raw video links safely.
*   **Student Dashboard**: A personal learning dashboard for students to track progress, access notes, view announcements, and ask questions to the AI assistant.
*   **Admin Management Hub**: A dashboard for admins to catalog lectures, manage students, verify bank slips, upload notes, schedule live broadcasts, and broadcast notices.

## 🛠️ Tech Stack

*   **Frontend**: React (with Vite), TailwindCSS, Recharts, Lucide Icons, React Router.
*   **Backend**: Node.js, Express, MongoDB (Mongoose), JWT Auth.
*   **Video Playback**: ReactPlayer (v3 wrapper).

## 💻 Local Setup & Execution

### 1. Server Configuration
1. Navigate to the `/server` directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file using the template:
   ```bash
   cp .env.example .env
   ```
4. Start the server:
   ```bash
   npm start
   ```

### 2. Client Configuration
1. Navigate to the `/client` directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite dev server:
   ```bash
   npm run dev
   ```
