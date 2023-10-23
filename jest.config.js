module.exports = {
  // Specifies the test environment - Node.js in this case
  testEnvironment: "node",

  // Tells Jest to handle `ts` and `tsx` files with ts-jest
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },

  // Specifies the file extensions Jest will work with
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],

  // Tells Jest which files to consider as test files
  testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$",

  // This is used if you want to use Babel along with TypeScript
  // transformIgnorePatterns: ["<rootDir>/node_modules/"],

  // Optionally, configure a mapping of file extensions to file names
  // moduleNameMapper: {
  //     '\\.(css|less)$': '<rootDir>/__mocks__/styleMock.js',
  // },
};
