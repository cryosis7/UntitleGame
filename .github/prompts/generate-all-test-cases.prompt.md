---
mode: agent
description: Document all logic paths to write test cases for.
tools:
  [
    'codebase',
    'editFiles',
    'fetch',
    'findTestFiles',
    'problems',
    'runCommands',
    'runTasks',
    'search',
    'searchResults',
    'terminalLastCommand',
    'terminalSelection',
    'usages',
  ]
---

# Document Logic Paths

Your job is to inspect a file provided by the user to examine all possible logic paths that can be executed.

Complete this by following these steps:
1. Examine the supplied file to identify what it's purpose is.
2. Document this in `copilot-artifacts/test-cases/{filename}`
3. Identify all the public functions and methods in the file.
4. Add them to the document, their purpose and when they are executed
5. For each function or method, determine the different paths the logic can take.
6. Document these paths clearly, including any input values that affect the path taken.
7. Describe why each path is important
8. Review the document that has been created for discrepencies
9. Ensure that the document is clear, concise, and easy to understand for someone who may not be familiar with the codebase. Reformat it if needed.
