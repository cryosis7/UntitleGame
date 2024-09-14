# Untitled Game

Untitled Game is a 2d platformer using React with Redux.

## Level Editor

The level editor is a UI interface that allows the designer to create a level for the game.
Schema's are defined that will tell the app how to render the input, which will allow a user to then add a property to the object. When the user finishes creating their object, their input values are used to materialise the object schema into a tangeble thing.

There are three types of objects. One relates to map ground tiles that make up the map, there's game objects, which are items that appear in the map, and effects - which can be linked to objects or map tiles and apply effects like slow or refilling health.

These objects will be serialized and stored in the redux store, so they must be plain json objects, they will not store functions in them.

## Framework - Vite with React and Redux

Uses [Vite](https://vitejs.dev/), [Vitest](https://vitest.dev/), and [React Testing Library](https://github.com/testing-library/react-testing-library) to create a modern [React](https://react.dev/) app compatible with [Create React App](https://create-react-app.dev/)

### UI 

MUI/Material UI is used for the default design system