# ✈️ AI Travel Planner

An AI-powered travel planning application that creates personalized trip itineraries based on your destination, travel dates, budget, number of travelers, and preferences.

The application uses Google's Gemini AI to generate intelligent travel plans and integrates additional services for weather information and trip storage.

## 🌐 Live Demo

🔗 **Live Application:** https://travel-9tqo9txsk-sinchanahb76s-projects.vercel.app/

---

## 📌 Overview

Planning a trip usually requires searching across multiple platforms for destinations, activities, restaurants, hotels, weather information, and budget estimates.

The AI Travel Planner brings these tasks together in one application.

Users can enter their:

- 📍 Destination
- 📅 Travel dates
- 👥 Number of travelers
- 💰 Budget
- 🍴 Food preferences
- 🎯 Travel interests
- 🏞️ Activity preferences

The application then uses Gemini AI to generate a personalized day-by-day travel itinerary.

---

## ✨ Features

### 🤖 AI-Powered Itinerary Generation

Uses Google's Gemini API to generate personalized travel plans based on user preferences.

### 📅 Day-by-Day Planning

Generates structured itineraries with activities organized according to each travel day.

### 💰 Budget Planning

Provides estimated budget information for different parts of the trip.

### 🏨 Accommodation Recommendations

Provides hotel/accommodation suggestions based on the generated travel plan.

### 🍽️ Restaurant & Food Recommendations

Suggests food and restaurant options based on the user's preferences and destination.

### 🌦️ Weather Information

Integrates the OpenWeather API to provide weather information for the destination.

### 🗺️ Interactive Maps

Displays travel destinations and locations using map integration.

### 💾 Save Trips

Users can save generated trips and retrieve them later.

### 📱 Responsive UI

The application is designed to work across desktop and mobile screen sizes.

### ⚡ Cloud Deployment

The application is deployed using Vercel with serverless backend API functions.

---

# 🛠️ Tech Stack

## Frontend

- React
- TypeScript
- Vite
- HTML5
- CSS

## Backend

- Node.js
- TypeScript
- Vercel Serverless Functions

## AI

- Google Gemini API

## Database

- MongoDB

## External APIs

- OpenWeather API

## Deployment

- Vercel

## Version Control

- Git
- GitHub

---

# 🏗️ Architecture

The application follows a frontend + serverless backend architecture.

```text
                    ┌──────────────────┐
                    │      User        │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │ React + Vite UI  │
                    │    Frontend      │
                    └────────┬─────────┘
                             │
                             ▼
                ┌──────────────────────────┐
                │ Vercel Serverless APIs   │
                └────────────┬─────────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
        ┌──────────┐   ┌──────────┐   ┌────────────┐
        │ Gemini   │   │ MongoDB  │   │ OpenWeather│
        │   API    │   │ Database │   │    API     │
        └──────────┘   └──────────┘   └────────────┘
              │              │              │
              └──────────────┼──────────────┘
                             ▼
                    ┌──────────────────┐
                    │ Generated Trip   │
                    │    Itinerary     │
                    └──────────────────┘

📂 Project Structure

ai-travel-planner/
│
├── api/
│   ├── _lib/
│   │   └── backendLogic.ts
│   │
│   ├── generate-itinerary.ts
│   ├── trips.ts
│   ├── weather.ts
│   └── health.ts
│
├── src/
│   ├── components/
│   ├── services/
│   ├── server/
│   ├── App.tsx
│   └── main.tsx
│
├── public/
│
├── package.json
├── tsconfig.json
├── vite.config.ts
├── vercel.json
└── README.md

🔌 API Endpoints

The backend is implemented using Vercel Serverless Functions.

Endpoint	Method	Purpose
/api/generate-itinerary	POST	Generate an AI travel itinerary
/api/trips	GET	Retrieve saved trips
/api/trips	POST	Save a trip
/api/trips/:id	DELETE	Delete a saved trip
/api/weather	GET	Retrieve weather information
/api/health	GET	Check backend health


🔑 Environment Variables

Create a .env.local file for local development.

GEMINI_API_KEY=your_gemini_api_key
MONGODB_URI=your_mongodb_connection_string
OPENWEATHER_API_KEY=your_openweather_api_key

🚀 Getting Started
1. Clone the repository
git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git

2. Navigate into the project
cd ai-travel-planner

3. Install dependencies
npm install

4. Configure environment variables


Create:

.env.local

and add:

GEMINI_API_KEY=your_key
MONGODB_URI=your_connection_string
OPENWEATHER_API_KEY=your_key

5. Start the development server
npm run dev

The application will be available at:

http://localhost:5173
🏗️ Production Build

To create a production build:

npm run build

To verify TypeScript:

npx tsc --noEmit
☁️ Deployment

The application is deployed on Vercel.

Deployment flow
Local Development
       ↓
     Git
       ↓
    GitHub
       ↓
     Vercel
       ↓
Production

Vercel automatically builds and deploys the application whenever changes are pushed to the connected GitHub repository.
