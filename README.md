# Codeit

## Project Description
Code-It is a search engine designed to help users find coding problems. Using the TF-IDF (Term Frequency-Inverse Document Frequency) algorithm, Code-It processes user queries and retrieves the most relevant coding problems. Its intuitive interface ensures users can easily navigate and find the coding challenges they need.

## Author
- [@ShubhamRaj](https://github.com/shubh062)

## Tech Stack
- **Client:** EJS
- **Server:** Node, Express

## Features
1. Developed a high-performance search engine using the MERN stack, incorporating modern web technologies to deliver a seamless user experience.
2. Scraped and processed a diverse dataset of 3,500 problems from leading coding platforms (LeetCode, InterviewBit, Codeforces) using Selenium, ensuring a comprehensive collection of programming challenges.
3. Implemented robust edge case handling techniques, including converting numbers to words and vice versa, lemmatization, spell-checking, camel case to words conversion, to generate relevant keywords from user query strings.
4. Utilized the BM25 algorithm and TF-IDF indexes to rank documents efficiently against query strings, and optimized search speed by leveraging RAM-based indexes and efficient data structures to enhance search performance.
5. Incorporated custom scoring metrics, including title matching and source reliability, to further enhance search relevance and user experience, ensuring accurate and trustworthy results appear prominently.

## Demo
### Home Page
![Code-It/public/Screenshot 2024-06-29 172555.png](<public/Screenshot 2024-06-29 172555.png>)
### Search Results
![Code-It/public/Screenshot 2024-06-29 172718.png](<public/Screenshot 2024-06-29 172718.png>)
### Detailed View
![Code-It/public/Screenshot 2024-06-29 172731.png](<public/Screenshot 2024-06-29 172731.png>)


## Installation Instructions
1. Clone the repository:
   ```bash
   git clone https://github.com/prince-mann/Code-It.git

2. Navigate to the project directory:
   ```bash
     cd codeit
3. Install the dependencies:
   ```bash
   npm install
4. Run the application:
   ```bash
   node app.js

## Usage Instructions
- Open your browser and navigate to http://localhost:3000.
- Use the search bar to input your coding problem queries.
- Browse through the search results to find relevant coding problems.

## Contribution Guidelines
I welcome contributions to Code-It! If you have any ideas, feel free to fork the repository and submit a pull request. Please make sure your contributions align with the project's goals and follow the established coding standards.