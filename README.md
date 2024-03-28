# Gambling Mathematics

Gambling Mathematics is a project developed by the Department of Visual Media (DVM) for the APOGEE 2024 Technical Fest of BITS Pilani. It was utilized for a Math-based quiz conducted by the Mathematics Association.

## Overview

In this game, users select a category and place a bet on whether they will answer its corresponding question correctly. Based on their answer, they either gain points or lose them. The game continues until the user runs out of points or completes all the available categories.

## Tech Stack

The project is built using ReactJS and integrates with backend-fetched randomized data through provided APIs.

## Workflow

1. User selects a category.
2. User places a bet on whether they will answer the question correctly or not.
3. A question related to the selected category is displayed.
4. User answers the question.
5. If the answer is correct, the user gains points; otherwise, they lose points.
6. Steps 2-5 repeat until the user has exhausted all their points or completed all the categories.

## Getting Started

To run the application, follow these instructions:

1. Clone this repository using:

```bash
git clone https://github.com/bit-by-bits/Gambling-Mathematics
```

2. Navigate to the project directory:

```bash
cd Gambling-Mathematics
```

3. Install the necessary dependencies:

```bash
yarn install
```

4. Run the application:

```bash
yarn dev
```

This command will start the development server and open the application in the default browser.

## Contributing

Contributions to this project are welcome. Please open an issue or submit a pull request if you have any suggestions or improvements.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.