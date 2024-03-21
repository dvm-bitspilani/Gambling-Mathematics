# Gambling Mathematics

This project was developed by the Department of Visual Media (DVM) for the APOGEE 2023 Technical Fest of BITS Pilani. It was used for a Math-based quiz conducted by the Mathematics Association.

## Overview

The game involved users selecting a category and placing a bet on whether they would answer its question correctly or not. If they answered correctly, they received more points, otherwise, they lost points. The game would repeat until the user had exhausted all their points or completed all the categories.

## Tech Stack

The project was built using ReactJS and integrates with backend-fetched randomised data through APIs provided. <br />
The file structure of the project is as follows:

-   `public`: This directory contains the public assets of the project.
-   `src`: This directory contains the source code of the project.
-   `.gitignore`: This file specifies files and directories that should be ignored by Git.
-   `.prettierrc.json`: This file specifies the Prettier configuration.
-   `README.md`: This file contains the information about the project.
-   `index.html`: This file is the entry point for the ReactJS application.
-   `package-lock.json`: This file specifies the exact version of each installed npm package.
-   `package.json`: This file contains the metadata of the project and lists the dependencies.
-   `vite.config.js`: This file contains the configuration for the Vite build tool.
-   `yarn.lock`: This file specifies the exact version of each installed Yarn package.

## Workflow

1. User selects a category.
2. User places a bet on whether they will answer the question correctly or not.
3. A question related to the selected category is displayed.
4. User answers the question.
5. If the answer is correct, the user gains points. Otherwise, they lose points.
6. Steps 2-5 repeat until the user has exhausted all their points or completed all the categories.

## Getting Started

To run the application, follow the below instructions:

Clone this repository using the following command:

```bash
git clone https://github.com/<username>/Gambling-Mathematics.git
```

Navigate to the project directory using the following command:

```bash
cd Gambling-Mathematics
```

Install the necessary dependencies using the following command:

```node
npm install
```

Run the application using the following command:

```node
npm start
```

This command will start the development server and open the application in the default browser.

## Contributing

Contributions to this project are welcome. Please open an issue or submit a pull request if you have any suggestions or improvements.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
