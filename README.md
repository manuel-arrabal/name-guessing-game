# 🇪🇸 Spanish Baby Name Guessing Game

A small, data-driven web game where players guess which baby name was more popular in Spain in a given year.

The game is based on **official statistics from the Spanish National Institute of Statistics (INE)** and currently uses data from **2002 to 2023**.

Inspired by projects like [namegrid.app](https://namegrid.app/), this project turns real demographic data into a simple, fast, and educational game.

---

## 🎮 How the game works

- For each question, the game selects:
  - a **year** (between 2002 and 2023)
  - a **gender** (male or female)
- Three names are shown.
- The player must guess **which name had more registered births in Spain** that year.
- After answering, the game shows the **real numbers** from the dataset.

The difficulty is balanced by choosing names with **similar popularity**, so guessing is not trivial.

---

## 📊 Data source

All data comes from **publicly available, aggregated statistics** published by the:

**Instituto Nacional de Estadística (INE)**  
https://www.ine.es

- The dataset contains **no personal or identifiable information**.
- Only total birth counts per name, year, and gender are used.

---

## 🗂 Data format

The core dataset is stored as a CSV file with the following structure:

```csv
year,gender,name,count
2021,M,HUGO,3126
2021,F,LUCIA,3076
2022,M,MATEO,2980
...
