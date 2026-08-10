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

